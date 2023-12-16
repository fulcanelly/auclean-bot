
module Info
  ( c
  , testt
  )
  where

import Prelude

import Data.Maybe (Maybe(..), maybe)
import Data.Tuple (Tuple(..))
import Effect.Aff (Aff)
import Effect.Console (log)

import Effect




c = maybe

bb = Nothing

sdf = Tuple 1 9

testt ∷ Effect Unit
testt = do
  log "hello"

-- import Control.Monad

-- import Control.Monad.Eff.Console (log)
-- import Control.Monad.Maybe (Maybe(..), fromJust, maybe, fromMaybe)


type ChannelInfo = { category :: String, username :: String, country :: String, ageDays :: Int, postsCount :: Int }

-- getServerSideProps :: F Unit

