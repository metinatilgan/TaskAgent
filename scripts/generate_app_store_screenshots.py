from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import math
import textwrap

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "app-store-screenshots"
ICON = ROOT / "assets" / "icon.png"

FONT_REGULAR = "/System/Library/Fonts/SFNS.ttf"
FONT_BOLD = "/System/Library/Fonts/SFNS.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size=size)


@dataclass(frozen=True)
class LocaleCopy:
    code: str
    hero: str
    sub: str
    today: str
    tasks: str
    history: str
    profile: str
    premium: str
    task_rows: tuple[str, str, str]
    areas: tuple[str, str, str]
    history_rows: tuple[tuple[str, str], tuple[str, str], tuple[str, str]]
    paywall_body: str
    restore: str
    monthly: str
    yearly: str
    trial: str
    premium_features: tuple[str, str, str]
    profile_name: str
    profile_role: str


COPIES = {
    "en": LocaleCopy(
        code="en",
        hero="Plan every day with calm focus.",
        sub="Tasks, routines, history, and Premium sync in one workspace.",
        today="Today",
        tasks="Tasks",
        history="History",
        profile="Profile",
        premium="Premium",
        task_rows=("Prepare product roadmap notes", "Send design review summary", "Thirty-minute recovery walk"),
        areas=("Work", "Personal", "Health"),
        history_rows=(("Product roadmap notes", "Completed"), ("Design review summary", "Missed"), ("Recovery walk", "Completed")),
        paywall_body="Start Premium through the App Store. Your 3-day trial is managed by Apple.",
        restore="Restore Purchases",
        monthly="$2.99 / month",
        yearly="$29.99 / year",
        trial="3 Days Free",
        premium_features=("Unlimited tasks", "Cloud sync", "Priority support"),
        profile_name="TaskAgent User",
        profile_role="Editorial Workspace",
    ),
    "tr": LocaleCopy(
        code="tr",
        hero="Her günü sakin odakla planla.",
        sub="Görevler, rutinler, geçmiş ve Premium eşitleme tek çalışma alanında.",
        today="Bugün",
        tasks="Görevler",
        history="Geçmiş",
        profile="Profil",
        premium="Premium",
        task_rows=("Ürün yol haritası notlarını hazırla", "Tasarım değerlendirme özetini gönder", "Otuz dakikalık toparlanma yürüyüşü"),
        areas=("İş", "Kişisel", "Sağlık"),
        history_rows=(("Ürün yol haritası notları", "Tamamlandı"), ("Tasarım değerlendirme özeti", "Yapılmadı"), ("Toparlanma yürüyüşü", "Tamamlandı")),
        paywall_body="Premium'u App Store üzerinden başlat. 3 günlük deneme Apple tarafından yönetilir.",
        restore="Satın Alımları Geri Yükle",
        monthly="$2.99 / ay",
        yearly="$29.99 / yıl",
        trial="3 Gün Ücretsiz",
        premium_features=("Sınırsız görev", "Bulut eşitleme", "Öncelikli destek"),
        profile_name="TaskAgent Kullanıcısı",
        profile_role="Editoryal Çalışma Alanı",
    ),
}


SCREENS = (
    ("01-today", "today"),
    ("02-tasks", "tasks"),
    ("03-history", "history"),
    ("04-premium", "premium"),
    ("05-profile", "profile"),
)

SIZES = {
    "iphone-6-9": (1290, 2796),
    "ipad-13": (2048, 2732),
}

PALETTE = {
    "ink": (31, 41, 55),
    "muted": (92, 104, 121),
    "line": (223, 229, 237),
    "surface": (255, 255, 255),
    "paper": (247, 250, 252),
    "blue": (32, 105, 246),
    "cyan": (22, 183, 224),
    "orange": (255, 139, 31),
    "green": (38, 162, 105),
    "red": (214, 80, 80),
}


def rounded_rectangle(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill, outline=None, width=1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, size: int, fill=PALETTE["ink"], bold: bool = False, max_width: int | None = None, line_gap: int = 10) -> int:
    face = font(size, bold)
    x, y = xy
    if max_width is None:
        draw.text((x, y), text, font=face, fill=fill)
        return y + draw.textbbox((x, y), text, font=face)[3] - y

    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if draw.textlength(candidate, font=face) <= max_width or not line:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)

    line_height = int(size * 1.2)
    for idx, item in enumerate(lines):
        draw.text((x, y + idx * (line_height + line_gap)), item, font=face, fill=fill)
    return y + len(lines) * line_height + max(0, len(lines) - 1) * line_gap


def shadow_layer(size: tuple[int, int], box: tuple[int, int, int, int], radius: int, opacity: int = 42, blur: int = 26) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle(box, radius=radius, fill=(30, 45, 70, opacity))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def gradient_background(width: int, height: int) -> Image.Image:
    image = Image.new("RGB", (width, height), PALETTE["paper"])
    pixels = image.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        for x in range(width):
            s = x / max(width - 1, 1)
            r = int(244 + 5 * (1 - t) + 2 * s)
            g = int(249 + 3 * (1 - s))
            b = int(252 - 8 * t)
            pixels[x, y] = (r, g, b)
    return image


def draw_status_bar(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], scale: float) -> None:
    x1, y1, x2, _ = box
    draw_text(draw, (x1 + int(46 * scale), y1 + int(28 * scale)), "9:41", int(16 * scale), bold=True)
    right = x2 - int(46 * scale)
    y = y1 + int(36 * scale)
    draw.rounded_rectangle((right - int(62 * scale), y, right - int(18 * scale), y + int(15 * scale)), radius=int(4 * scale), outline=PALETTE["ink"], width=max(1, int(2 * scale)))
    draw.rectangle((right - int(54 * scale), y + int(4 * scale), right - int(26 * scale), y + int(11 * scale)), fill=PALETTE["green"])
    draw.rectangle((right - int(12 * scale), y + int(5 * scale), right - int(8 * scale), y + int(10 * scale)), fill=PALETTE["ink"])


def draw_bottom_tabs(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], copy: LocaleCopy, active: str, scale: float) -> None:
    x1, _, x2, y2 = box
    tab_h = int(84 * scale)
    top = y2 - tab_h
    draw.line((x1, top, x2, top), fill=PALETTE["line"], width=max(1, int(1.5 * scale)))
    tabs = [("today", copy.today), ("tasks", copy.tasks), ("history", copy.history), ("premium", copy.premium), ("profile", copy.profile)]
    step = (x2 - x1) / len(tabs)
    for idx, (key, label) in enumerate(tabs):
        cx = int(x1 + step * idx + step / 2)
        color = PALETTE["blue"] if key == active else PALETTE["muted"]
        draw.ellipse((cx - int(10 * scale), top + int(16 * scale), cx + int(10 * scale), top + int(36 * scale)), fill=color)
        w = draw.textlength(label, font=font(int(11 * scale), bold=key == active))
        draw.text((cx - w / 2, top + int(45 * scale)), label, font=font(int(11 * scale), bold=key == active), fill=color)


def draw_app_chrome(base: Image.Image, copy: LocaleCopy, title: str, subtitle: str, active: str, scale: float) -> tuple[ImageDraw.ImageDraw, tuple[int, int, int, int]]:
    draw = ImageDraw.Draw(base)
    w, h = base.size
    margin = int(46 * scale)
    app_box = (margin, int(350 * scale), w - margin, h - int(76 * scale))
    base.alpha_composite(shadow_layer(base.size, app_box, int(42 * scale), opacity=34, blur=int(22 * scale)))
    draw.rounded_rectangle(app_box, radius=int(42 * scale), fill=PALETTE["surface"], outline=(230, 235, 242), width=max(1, int(1 * scale)))
    draw_status_bar(draw, app_box, scale)
    x1, y1, x2, y2 = app_box
    header_y = y1 + int(88 * scale)
    draw_text(draw, (x1 + int(40 * scale), header_y), title, int(38 * scale), bold=True)
    draw_text(draw, (x1 + int(40 * scale), header_y + int(48 * scale)), subtitle, int(16 * scale), fill=PALETTE["muted"], max_width=x2 - x1 - int(80 * scale), line_gap=int(4 * scale))
    draw_bottom_tabs(draw, app_box, copy, active, scale)
    content = (x1 + int(40 * scale), header_y + int(118 * scale), x2 - int(40 * scale), y2 - int(110 * scale))
    return draw, content


def draw_task_card(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str, meta: str, color, scale: float, checked: bool = False) -> None:
    rounded_rectangle(draw, box, int(20 * scale), fill=(255, 255, 255), outline=PALETTE["line"], width=max(1, int(1 * scale)))
    x1, y1, x2, y2 = box
    cx = x1 + int(30 * scale)
    cy = y1 + int(34 * scale)
    draw.ellipse((cx - int(11 * scale), cy - int(11 * scale), cx + int(11 * scale), cy + int(11 * scale)), fill=color if checked else (255, 255, 255), outline=color, width=max(2, int(2 * scale)))
    draw_text(draw, (x1 + int(58 * scale), y1 + int(20 * scale)), title, int(17 * scale), bold=True, max_width=x2 - x1 - int(90 * scale), line_gap=0)
    draw_text(draw, (x1 + int(58 * scale), y2 - int(36 * scale)), meta, int(13 * scale), fill=PALETTE["muted"])


def draw_today(content: tuple[int, int, int, int], draw: ImageDraw.ImageDraw, copy: LocaleCopy, scale: float) -> None:
    x1, y1, x2, _ = content
    card_h = int(150 * scale)
    rounded_rectangle(draw, (x1, y1, x2, y1 + card_h), int(24 * scale), fill=(239, 246, 255), outline=(210, 225, 252))
    draw_text(draw, (x1 + int(26 * scale), y1 + int(24 * scale)), "72%", int(42 * scale), fill=PALETTE["blue"], bold=True)
    draw_text(draw, (x1 + int(26 * scale), y1 + int(82 * scale)), copy.hero, int(17 * scale), max_width=x2 - x1 - int(52 * scale), fill=PALETTE["ink"])
    bar_y = y1 + card_h + int(28 * scale)
    rounded_rectangle(draw, (x1, bar_y, x2, bar_y + int(18 * scale)), int(9 * scale), fill=(229, 236, 245))
    rounded_rectangle(draw, (x1, bar_y, x1 + int((x2 - x1) * 0.72), bar_y + int(18 * scale)), int(9 * scale), fill=PALETTE["blue"])
    y = bar_y + int(48 * scale)
    labels = ("09:30 · Work", "11:00 · Work", "19:30 · Health")
    for idx, title in enumerate(copy.task_rows):
        draw_task_card(draw, (x1, y + idx * int(92 * scale), x2, y + idx * int(92 * scale) + int(76 * scale)), title, labels[idx], (PALETTE["orange"], PALETTE["blue"], PALETTE["green"])[idx], scale, checked=idx == 2)


def draw_tasks(content: tuple[int, int, int, int], draw: ImageDraw.ImageDraw, copy: LocaleCopy, scale: float) -> None:
    x1, y1, x2, _ = content
    area_w = int((x2 - x1 - int(20 * scale) * 2) / 3)
    for idx, area in enumerate(copy.areas):
        ax = x1 + idx * (area_w + int(20 * scale))
        color = (PALETTE["blue"], PALETTE["orange"], PALETTE["green"])[idx]
        rounded_rectangle(draw, (ax, y1, ax + area_w, y1 + int(90 * scale)), int(18 * scale), fill=(255, 255, 255), outline=PALETTE["line"])
        draw.ellipse((ax + int(18 * scale), y1 + int(18 * scale), ax + int(40 * scale), y1 + int(40 * scale)), fill=color)
        draw_text(draw, (ax + int(18 * scale), y1 + int(50 * scale)), area, int(14 * scale), bold=True, max_width=area_w - int(36 * scale), line_gap=0)
    y = y1 + int(122 * scale)
    details = ("High · Today", "Medium · Today", "Daily · 19:30")
    for idx, title in enumerate(copy.task_rows):
        draw_task_card(draw, (x1, y + idx * int(104 * scale), x2, y + idx * int(104 * scale) + int(88 * scale)), title, details[idx], (PALETTE["red"], PALETTE["blue"], PALETTE["green"])[idx], scale)


def draw_history(content: tuple[int, int, int, int], draw: ImageDraw.ImageDraw, copy: LocaleCopy, scale: float) -> None:
    x1, y1, x2, _ = content
    rounded_rectangle(draw, (x1, y1, x2, y1 + int(112 * scale)), int(22 * scale), fill=(247, 251, 249), outline=(216, 238, 225))
    draw_text(draw, (x1 + int(24 * scale), y1 + int(22 * scale)), "3", int(34 * scale), fill=PALETTE["green"], bold=True)
    draw_text(draw, (x1 + int(80 * scale), y1 + int(26 * scale)), copy.history, int(24 * scale), bold=True)
    draw_text(draw, (x1 + int(80 * scale), y1 + int(60 * scale)), "Completed and missed tasks stay visible.", int(14 * scale), fill=PALETTE["muted"], max_width=x2 - x1 - int(110 * scale))
    y = y1 + int(148 * scale)
    for idx, (title, status) in enumerate(copy.history_rows):
        color = PALETTE["green"] if idx != 1 else PALETTE["red"]
        draw_task_card(draw, (x1, y + idx * int(96 * scale), x2, y + idx * int(96 * scale) + int(78 * scale)), title, status, color, scale, checked=idx != 1)


def draw_premium(content: tuple[int, int, int, int], draw: ImageDraw.ImageDraw, copy: LocaleCopy, scale: float) -> None:
    x1, y1, x2, _ = content
    rounded_rectangle(draw, (x1, y1, x2, y1 + int(136 * scale)), int(24 * scale), fill=(238, 246, 255), outline=(210, 225, 252))
    draw_text(draw, (x1 + int(24 * scale), y1 + int(22 * scale)), copy.trial, int(30 * scale), fill=PALETTE["blue"], bold=True)
    draw_text(draw, (x1 + int(24 * scale), y1 + int(70 * scale)), copy.paywall_body, int(15 * scale), fill=PALETTE["muted"], max_width=x2 - x1 - int(48 * scale), line_gap=2)
    y = y1 + int(166 * scale)
    for idx, (title, price) in enumerate((("Monthly" if copy.code == "en" else "Aylık", copy.monthly), ("Yearly" if copy.code == "en" else "Yıllık", copy.yearly))):
        rounded_rectangle(draw, (x1, y + idx * int(108 * scale), x2, y + idx * int(108 * scale) + int(88 * scale)), int(18 * scale), fill=(255, 255, 255), outline=PALETTE["line"])
        draw_text(draw, (x1 + int(24 * scale), y + idx * int(108 * scale) + int(22 * scale)), title, int(20 * scale), bold=True)
        draw_text(draw, (x2 - int(190 * scale), y + idx * int(108 * scale) + int(22 * scale)), price, int(18 * scale), fill=PALETTE["blue"], bold=True)
    fy = y + int(236 * scale)
    for idx, feature in enumerate(copy.premium_features):
        draw.ellipse((x1 + int(4 * scale), fy + idx * int(38 * scale), x1 + int(22 * scale), fy + idx * int(38 * scale) + int(18 * scale)), fill=PALETTE["green"])
        draw_text(draw, (x1 + int(34 * scale), fy + idx * int(38 * scale) - int(4 * scale)), feature, int(16 * scale))
    rounded_rectangle(draw, (x1, fy + int(138 * scale), x2, fy + int(190 * scale)), int(18 * scale), fill=(245, 247, 251), outline=PALETTE["line"])
    draw_text(draw, (x1 + int(26 * scale), fy + int(152 * scale)), copy.restore, int(15 * scale), fill=PALETTE["blue"], bold=True)


def draw_profile(content: tuple[int, int, int, int], draw: ImageDraw.ImageDraw, copy: LocaleCopy, scale: float) -> None:
    x1, y1, x2, _ = content
    draw.ellipse((x1, y1, x1 + int(94 * scale), y1 + int(94 * scale)), fill=(225, 236, 255))
    draw_text(draw, (x1 + int(120 * scale), y1 + int(12 * scale)), copy.profile_name, int(24 * scale), bold=True)
    draw_text(draw, (x1 + int(120 * scale), y1 + int(50 * scale)), copy.profile_role, int(15 * scale), fill=PALETTE["muted"])
    y = y1 + int(134 * scale)
    rows = [
        (copy.premium, copy.trial),
        ("Language" if copy.code == "en" else "Dil", "English / Türkçe"),
        ("Notifications" if copy.code == "en" else "Bildirimler", "Enabled" if copy.code == "en" else "Açık"),
        ("Legal" if copy.code == "en" else "Yasal", "Terms, Privacy, Support"),
    ]
    for idx, (title, detail) in enumerate(rows):
        top = y + idx * int(88 * scale)
        rounded_rectangle(draw, (x1, top, x2, top + int(70 * scale)), int(18 * scale), fill=(255, 255, 255), outline=PALETTE["line"])
        draw_text(draw, (x1 + int(24 * scale), top + int(18 * scale)), title, int(18 * scale), bold=True)
        w = draw.textlength(detail, font=font(int(14 * scale)))
        draw.text((x2 - int(24 * scale) - w, top + int(22 * scale)), detail, font=font(int(14 * scale)), fill=PALETTE["muted"])


def draw_marketing_header(base: Image.Image, copy: LocaleCopy, screen: str, scale: float) -> None:
    draw = ImageDraw.Draw(base)
    w, _ = base.size
    icon_size = int(84 * scale)
    if ICON.exists():
        icon = Image.open(ICON).convert("RGBA").resize((icon_size, icon_size), Image.LANCZOS)
        base.alpha_composite(icon, (int(58 * scale), int(82 * scale)))
    draw_text(draw, (int(160 * scale), int(86 * scale)), "TaskAgent", int(32 * scale), bold=True)
    title_map = {
        "today": copy.hero,
        "tasks": copy.sub,
        "history": "Track completed and missed work." if copy.code == "en" else "Tamamlanan ve yapılmayan işleri izle.",
        "premium": copy.trial,
        "profile": "Sync preferences across devices." if copy.code == "en" else "Tercihlerini cihazlar arasında eşitle.",
    }
    y = draw_text(draw, (int(58 * scale), int(188 * scale)), title_map[screen], int(50 * scale), bold=True, max_width=w - int(116 * scale), line_gap=int(8 * scale))
    draw_text(draw, (int(58 * scale), y + int(8 * scale)), copy.sub if screen == "today" else "Built for daily focus and recurring routines." if copy.code == "en" else "Günlük odak ve tekrarlayan rutinler için tasarlandı.", int(22 * scale), fill=PALETTE["muted"], max_width=w - int(116 * scale), line_gap=int(4 * scale))


def build(locale: LocaleCopy, size_key: str, size: tuple[int, int], screen_key: str, screen: str) -> Image.Image:
    width, height = size
    scale = width / 1290
    base = gradient_background(width, height).convert("RGBA")
    draw_marketing_header(base, locale, screen, scale)
    titles = {
        "today": locale.today,
        "tasks": locale.tasks,
        "history": locale.history,
        "premium": locale.premium,
        "profile": locale.profile,
    }
    subtitles = {
        "today": "3 active tasks" if locale.code == "en" else "3 aktif görev",
        "tasks": "Search, prioritize, and repeat" if locale.code == "en" else "Ara, önceliklendir ve tekrarla",
        "history": "Completed and missed tasks" if locale.code == "en" else "Tamamlanan ve yapılmayan görevler",
        "premium": "$2.99 monthly · $29.99 yearly" if locale.code == "en" else "Aylık $2.99 · yıllık $29.99",
        "profile": "Account, language, and support" if locale.code == "en" else "Hesap, dil ve destek",
    }
    draw, content = draw_app_chrome(base, locale, titles[screen], subtitles[screen], screen if screen in {"today", "tasks", "history", "premium", "profile"} else "today", scale)
    if screen == "today":
        draw_today(content, draw, locale, scale)
    elif screen == "tasks":
        draw_tasks(content, draw, locale, scale)
    elif screen == "history":
        draw_history(content, draw, locale, scale)
    elif screen == "premium":
        draw_premium(content, draw, locale, scale)
    else:
        draw_profile(content, draw, locale, scale)
    return base.convert("RGB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for locale in COPIES.values():
        for size_key, size in SIZES.items():
            target = OUT / locale.code / size_key
            target.mkdir(parents=True, exist_ok=True)
            for file_prefix, screen in SCREENS:
                image = build(locale, size_key, size, file_prefix, screen)
                image.save(target / f"{file_prefix}.png", optimize=True)


if __name__ == "__main__":
    main()
