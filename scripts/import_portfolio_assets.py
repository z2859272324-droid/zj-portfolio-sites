from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PHOTO_SOURCE = Path(r"D:\Desktop\社会闲散人员\求职\个人作品集网站\摄影")
ARCH_SOURCE = Path(r"D:\Desktop\社会闲散人员\求职\个人作品集网站\建筑")
VIDEO_SOURCE = PHOTO_SOURCE / "首页视频.mp4"
PROFILE_SOURCE = PHOTO_SOURCE / "DSC00387-1.jpg"

GALLERY_TARGET = ROOT / "public" / "assets" / "gallery"
ARCH_TARGET = ROOT / "public" / "assets" / "architecture"
MEDIA_TARGET = ROOT / "public" / "media"
PROFILE_TARGET = ROOT / "public" / "assets" / "profile" / "dsc00387-original.webp"
DATA_TARGET = ROOT / "src" / "data" / "media.generated.ts"

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


def natural_key(path: Path) -> list[object]:
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", path.name)]


def convert_image(source: Path, target: Path, size: tuple[int, int], quality: int) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail(size, Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=quality, method=6)


def ts(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


def main() -> None:
    GALLERY_TARGET.mkdir(parents=True, exist_ok=True)
    ARCH_TARGET.mkdir(parents=True, exist_ok=True)
    MEDIA_TARGET.mkdir(parents=True, exist_ok=True)

    photo_sources = sorted(
        [path for path in PHOTO_SOURCE.iterdir() if path.is_file() and path.suffix.casefold() in IMAGE_SUFFIXES],
        key=natural_key,
    )
    gallery_items: list[dict[str, str]] = []
    for index, source in enumerate(photo_sources, start=1):
        filename = f"photo-{index:03d}.webp"
        convert_image(source, GALLERY_TARGET / filename, (1600, 1600), 80)
        gallery_items.append(
            {
                "src": f"/assets/gallery/{filename}",
                "alt": f"张进摄影作品 · {source.stem}",
                "title": source.stem,
            }
        )

    photo_rows = [gallery_items[row::4] for row in range(4)]

    architecture_projects: list[dict[str, object]] = []
    project_dirs = sorted([path for path in ARCH_SOURCE.iterdir() if path.is_dir()], key=natural_key)
    for project_index, project_dir in enumerate(project_dirs, start=1):
        image_sources = sorted(
            [
                path
                for path in project_dir.rglob("*")
                if path.is_file() and path.suffix.casefold() in IMAGE_SUFFIXES
            ],
            key=natural_key,
        )
        project_target = ARCH_TARGET / f"project-{project_index:02d}"
        images: list[dict[str, str]] = []
        for image_index, source in enumerate(image_sources, start=1):
            filename = f"{image_index:02d}.webp"
            convert_image(source, project_target / filename, (2200, 1800), 86)
            images.append(
                {
                    "src": f"/assets/architecture/project-{project_index:02d}/{filename}",
                    "alt": f"{project_dir.name} · 图 {image_index}",
                }
            )
        architecture_projects.append(
            {
                "id": f"architecture-{project_index:02d}",
                "number": f"{project_index:02d}",
                "title": project_dir.name,
                "category": "ARCHITECTURE",
                "images": images,
            }
        )

    aigc_projects = [
        {
            "id": f"aigc-{index:02d}",
            "number": f"{index:02d}",
            "title": f"AIGC 项目 {index:02d}",
            "category": "AIGC",
            "images": [],
        }
        for index in range(1, 7)
    ]

    source = "\n".join(
        [
            "// 此文件由 scripts/import_portfolio_assets.py 根据素材目录自动生成。",
            "export type GalleryMedia = { src: string; alt: string; title: string }",
            "export type PortfolioProject = {",
            "  id: string",
            "  number: string",
            "  title: string",
            "  category: string",
            "  images: { src: string; alt: string }[]",
            "}",
            "",
            f"export const photographyRows: GalleryMedia[][] = {ts(photo_rows)}",
            "",
            f"export const architectureProjects: PortfolioProject[] = {ts(architecture_projects)}",
            "",
            f"export const aigcProjects: PortfolioProject[] = {ts(aigc_projects)}",
            "",
        ]
    )
    DATA_TARGET.write_text(source, encoding="utf-8")
    shutil.copy2(VIDEO_SOURCE, MEDIA_TARGET / "hero-v2.mp4")
    convert_image(PROFILE_SOURCE, PROFILE_TARGET, (1800, 1800), 90)

    print(
        json.dumps(
            {
                "photography": len(gallery_items),
                "rows": [len(row) for row in photo_rows],
                "architecture_projects": len(architecture_projects),
                "architecture_images": sum(len(project["images"]) for project in architecture_projects),
                "aigc_placeholders": len(aigc_projects),
                "hero_video": str(MEDIA_TARGET / "hero-v2.mp4"),
                "profile_image": str(PROFILE_TARGET),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
