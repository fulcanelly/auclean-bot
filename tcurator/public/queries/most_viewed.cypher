MATCH (c:Channel {id: $id})-[:POST_OF]->(p:ChannelPost)
CALL {
    WITH p
    MATCH (p)-[:HAD_VIEWS_AT]->(v:PostViews)

    RETURN p.id AS post_id, v.views AS views
    ORDER BY v.date DESC
    LIMIT 1
}
RETURN post_id, views
ORDER BY views DESC
LIMIT $limit


// Uncomment the following line to filter by date range
// WHERE v.date >= startDate AND v.date <= endDate
