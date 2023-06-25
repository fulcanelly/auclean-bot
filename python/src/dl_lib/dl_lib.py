# -*- coding: utf-8 -*-

import re
from dataclasses import dataclass
from typing import Union, List, Optional, Pattern, Callable
from pathlib import Path

from yt_dlp import YoutubeDL  # type: ignore


@dataclass
class UrlMap:
    pattern: Pattern[str]
    callback: Callable[[str], Optional[Path]]


# TODO: add method to remove downloaded files
class DlLib:
    YTDL_PARAMS = {
        'outtmpl': {
            'default': str(Path('%(id)s') / '%(title).250s.%(ext).5s'),
        }
    }

    def __init__(self, dl_dir: Union[Path, str] = 'dl_lib'):
        self.__dl_dir = Path(dl_dir)
        self.__dl_dir.mkdir(exist_ok=True)

        if outtmpl := self.YTDL_PARAMS.get('outtmpl'):
            for k, v in outtmpl.items():
                if not Path(v).is_absolute():
                    outtmpl[k] = str(self.__dl_dir / v)

        self.__url_map: List[UrlMap] = [
            UrlMap(re.compile(r'\w+://instagram.com/.*'), self.instagram_dl),
            UrlMap(re.compile(r'.*'), self.yt_dlp)
        ]

    # TODO: add options to convert to other formats
    # TODO: handle yt playlist and return list of file names
    def download(self, url: str) -> Optional[Path]:
        for i in self.__url_map:
            if i.pattern.match(url):
                return i.callback(url)
        return None

    def instagram_dl(self, url: str) -> Optional[Path]:
        raise NotImplementedError

    def yt_dlp(self, url: str) -> Optional[Path]:
        with YoutubeDL(self.YTDL_PARAMS) as ytdl:
            info = ytdl.extract_info(url, download=True)
            path = ytdl.prepare_filename(info)
            return Path(path) if path else None
