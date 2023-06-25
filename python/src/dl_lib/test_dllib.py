import logging
from pathlib import Path
from dataclasses import dataclass, asdict

import pytest

from .dl_lib import DlLib


OUTPUT_DIR = 'output'


@dataclass
class VideoInfo:
    id: str
    title: str
    ext: str


@pytest.fixture
def dl_lib() -> DlLib:
    return DlLib(dl_dir=OUTPUT_DIR)


@pytest.fixture(autouse=True)
def change_directory(tmpdir):
    tmpdir.chdir()


def test_path(dl_lib, monkeypatch):
    video_info = VideoInfo(id='Jxub_Q9gR6s', title='video_title', ext='webm')
    url = f'https://youtu.be/{video_info.id}'
    expected_path = (
        Path(OUTPUT_DIR)
        / video_info.id
        / f'{video_info.title}.{video_info.ext}'
    )

    logging.debug(video_info)
    logging.debug(f'{url = }')
    logging.debug(f'{expected_path = }')

    monkeypatch.setattr(
        __import__('yt_dlp', fromlist=['YoutubeDL']).YoutubeDL,
        'extract_info',
        lambda *_a, **_kw: asdict(video_info)
    )

    path = dl_lib.yt_dlp(url)

    assert path == expected_path
