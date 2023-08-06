package com.fulcanelly.curator.model.brainfuck;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.mockito.Answers;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Transaction;

import java.util.regex.Matcher;
import lombok.SneakyThrows;

public class Neo4jLogToDriverInjector {

    public static final String ANSI_RESET = "\u001B[0m";
    public static final String ANSI_YELLOW = "\u001B[33m";

    @SneakyThrows
    Object onTransactionRun(InvocationOnMock invocation) {
        var list = List.of(invocation.getArguments());
        System.out.println(highlight((String)list.get(0)));
        System.out.println(list.get(1));
        var result = invocation.callRealMethod();
        System.out.println(ANSI_YELLOW + result + ANSI_RESET);
        System.out.println("========");
        return result;
    }

    @SneakyThrows
    Object onBeginTransaction(InvocationOnMock invocation) {
        System.out.println(ANSI_YELLOW + "CREATING TRANSACTION" + ANSI_RESET);
        Transaction transaction = (Transaction) stub(invocation.callRealMethod());
        doAnswer(this::onTransactionRun).when(transaction).run(any(), ArgumentMatchers.<Map<String, Object>>any());
        return transaction;
    }

    @SneakyThrows
    Object onSessionRequest(InvocationOnMock invocation) {
        Session session = (Session) stub(invocation.callRealMethod());

        doAnswer(this::onBeginTransaction).when(session).beginTransaction();
        System.out.println("CREATING SESSION");
        return session;
    }

    public Driver inject(Driver driver) {
        var spiedDriver = stub(driver);
        doAnswer(this::onSessionRequest).when(spiedDriver).session(any(), any(), any());

        return spiedDriver;
    }

    @SuppressWarnings("unchecked")
    <T> T stub(T object) {
        var settings = Mockito.withSettings()
                .stubOnly()
                .spiedInstance(object)
                .defaultAnswer(Answers.CALLS_REAL_METHODS);
        return (T) mock(object.getClass(), settings);
    }

    private static final Set<String> neo4jKeywords = new HashSet<>(Arrays.asList(
            "UNWIND", "MATCH", "OPTIONAL", "WHERE", "CREATE", "MERGE", "DELETE", "DETACH", "SET", "REMOVE",
            "RETURN", "WITH", "UNION", "ORDER", "BY", "ASC", "DESC", "LIMIT", "SKIP", "IN", "AND",
            "OR", "NOT", "DISTINCT", "CASE", "WHEN", "THEN", "ELSE"));

    public static String highlight(String query) {
        // Regular expression pattern to match Neo4j keywords outside of single-quoted
        // and backtick-quoted literals
        String keywordPattern = "(?i)\\b(?<!['`])(?:" + String.join("|", neo4jKeywords) + ")(?!['`])\\b";

        // Compile the pattern
        Pattern pattern = Pattern.compile(keywordPattern);

        // Matcher to find matches in the query
        Matcher matcher = pattern.matcher(query);

        // StringBuilder to hold the highlighted query
        StringBuilder highlightedQuery = new StringBuilder();

        int lastEnd = 0;
        while (matcher.find()) {
            // Append the text before the keyword
            highlightedQuery.append(query, lastEnd, matcher.start());
            // Append the highlighted keyword
            highlightedQuery.append("\n");
            highlightedQuery.append("\033[1m"); // ANSI escape sequence for bold
            highlightedQuery.append(query, matcher.start(), matcher.end());
            highlightedQuery.append("\033[0m"); // ANSI escape sequence to reset text style
            lastEnd = matcher.end();
        }

        // Append the rest of the text after the last keyword
        highlightedQuery.append(query.substring(lastEnd));

        return highlightedQuery.toString();
    }

}
