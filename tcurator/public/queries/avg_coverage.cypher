MATCH (a:Channel {id: $id})-[]-(p:ChannelPost)-[]-(v:PostViews)
WHERe p.id % $precisionLoss = 0
UNWIND range(0, $items) AS i
WITH v, timestamp() / 1000 - i * $step AS begin
WITH v, begin, begin + $step AS finish
WHERE v.date > begin AND v.date < finish
RETURN
   datetime({
    epochSeconds: toInteger(begin)
   }) AS date,
   percentileDisc(v.views, 0.5) as coverage,
   avg(v.views) as avg
ORDER BY date
