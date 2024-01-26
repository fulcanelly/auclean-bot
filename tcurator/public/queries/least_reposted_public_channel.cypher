match (a:Channel)
optional match (a:Channel)-[:POST_OF]->(c:ChannelPost)-[:POST_FORWARD]->(e:ChannelPost)
optional match (a)<-[:SCANNED_FOR]-(sc:ChannelScanLog)
with a, count(distinct sc) as scanCount, count(distinct e) as repostCount
where scanCount = 0  AND repostCount <> 0 and (a.username IS NOT NULL)
return a
order by repostCount asc
limit 1
