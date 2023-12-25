MATCH (c:Channel { need_to_scan: true })
OPTIONAL MATCH (c)<-[:SCANNED_FOR]-(n:ChannelScanLog)
WITH c, MAX(n.finished_at) AS last_scan_time
WHERE last_scan_time IS NOT NULL AND last_scan_time < $noScansFrom
RETURN DISTINCT c
LIMIT $limit
