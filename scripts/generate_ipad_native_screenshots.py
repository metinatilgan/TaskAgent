from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import zipfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "app-store-ipad-native-screenshots"
ZIP_PATH = ROOT / "dist" / "taskagent-ipad-native-screenshots.zip"
ICON = ROOT / "assets" / "icon.png"

FONT_REGULAR = "/System/Library/Fonts/SFNS.ttf"
FONT_BOLD = "/System/Library/Fonts/SFNS.ttf"

IPAD_SIZES = {
    "13-inch-ipad-2064x2752": (2064, 2752),
    "12-9-compatible-2048x2732": (2048, 2732),
}

INK = (37, 42, 52)
MUTED = (91, 99, 113)
SUBTLE = (135, 145, 158)
LINE = (218, 226, 235)
PAPER = (244, 247, 251)
SURFACE = (255, 255, 255)
SOFT = (238, 243, 248)
PRIMARY = (65, 103, 151)
PRIMARY_DARK = (48, 82, 124)
BLUE_SOFT = (178, 210, 255)
DANGER = (255, 105, 105)
SUCCESS = (58, 155, 103)


@dataclass(frozen=True)
class Copy:
    code: str
    app_subtitle: str
    tabs: tuple[str, str, str, str, str]
    today_eyebrow: str
    today_title: str
    today_subtitle: str
    focus_flow: str
    completed: str
    open_tasks: str
    today_focus: str
    no_today: str
    no_today_body: str
    quick_areas: str
    tasks_eyebrow: str
    tasks_title: str
    new_task: str
    search: str
    progress: str
    active_left: str
    no_match: str
    no_match_body: str
    history_eyebrow: str
    history_title: str
    history_subtitle: str
    missed: str
    no_history: str
    no_history_body: str
    areas_eyebrow: str
    areas_title: str
    areas_subtitle: str
    active_task: str
    add_area: str
    category_name: str
    create_category: str
    full_name: str
    title_label: str
    save_profile: str
    premium: str
    premium_body: str
    go_premium: str
    notifications: str
    notifications_body: str
    language_en: str
    language_tr: str
    legal: str
    privacy: str
    terms: str
    subscription_terms: str
    support: str
    delete_account: str
    logout: str
    profile_name: str
    profile_email: str
    profile_initials: str
    profile_value: str
    profile_title_value: str
    trial: str
    choose_plan: str
    monthly: str
    yearly: str
    restore: str
    features: tuple[str, str, str]
    area_names: tuple[str, str, str]


COPIES = {
    "tr": Copy(
        code="tr",
        app_subtitle="Odak Alanı",
        tabs=("Bugün", "Görevler", "Geçmiş", "Alanlar", "Profil"),
        today_eyebrow="ÇALIŞMA ALANI / BUGÜN",
        today_title="Merhaba, Metin.",
        today_subtitle="Sıradaki önemli işleri daha sakin gör.",
        focus_flow="ODAK AKIŞI",
        completed="Tamamlandı",
        open_tasks="Açık Görev",
        today_focus="Bugünün Odağı",
        no_today="Bugün için görev yok",
        no_today_body="Yeni bir görev oluşturabilir ya da boş alanın tadını çıkarabilirsin.",
        quick_areas="Hızlı Alanlar",
        tasks_eyebrow="GÜNLÜK ODAK",
        tasks_title="Görevler",
        new_task="Yeni",
        search="Başlığa göre ara",
        progress="İLERLEME",
        active_left="0 aktif görev kaldı.",
        no_match="Eşleşen görev yok",
        no_match_body="Aramayı değiştir veya yeni bir odak noktası oluştur.",
        history_eyebrow="GEÇMİŞ",
        history_title="Görev Günlüğü",
        history_subtitle="Tamamlanan ve tamamlamadan kalan günleri birlikte gör.",
        missed="Tamamlanmayan",
        no_history="Henüz geçmiş yok",
        no_history_body="Görevler tamamlandıkça veya günlük işler yenilendikçe burada görünecek.",
        areas_eyebrow="DÜZENLE",
        areas_title="Alanlar",
        areas_subtitle="Kategoriler günü daha okunur tutar.",
        active_task="aktif görev",
        add_area="Alan Ekle",
        category_name="KATEGORİ ADI",
        create_category="Kategori Oluştur",
        full_name="AD SOYAD",
        title_label="UNVAN",
        save_profile="Profili Kaydet",
        premium="Premium",
        premium_body="Sınırsız görev ve gelişmiş iş akışları için planı incele.",
        go_premium="Premium'a Geç",
        notifications="Bildirimler",
        notifications_body="Görev hatırlatmaları için cihaz bildirimlerini kullan.",
        language_en="İngilizce",
        language_tr="Türkçe",
        legal="Yasal",
        privacy="Gizlilik Politikası",
        terms="Kullanım Şartları",
        subscription_terms="Abonelik Şartları",
        support="Destek",
        delete_account="Hesap ve Veri Silme",
        logout="Çıkış Yap",
        profile_name="Metin ATILGAN",
        profile_email="fnbmtn@hotmail.com",
        profile_initials="ME",
        profile_value="metin ATILGAN",
        profile_title_value="",
        trial="3 Gün Ücretsiz",
        choose_plan="Planını seç",
        monthly="$2.99 / ay",
        yearly="$29.99 / yıl",
        restore="Satın Alımları Geri Yükle",
        features=("Sınırsız görev", "Her gün yenilenen rutinler", "Geçmiş ve kaçırılan görev takibi"),
        area_names=("Sağlık", "İş", "Kişisel"),
    ),
    "en": Copy(
        code="en",
        app_subtitle="Focus Area",
        tabs=("Today", "Tasks", "History", "Areas", "Profile"),
        today_eyebrow="WORKSPACE / TODAY",
        today_title="Hello, Metin.",
        today_subtitle="See the next important work with more calm.",
        focus_flow="FOCUS FLOW",
        completed="Completed",
        open_tasks="Open Tasks",
        today_focus="Today's Focus",
        no_today="No tasks for today",
        no_today_body="Create a new task or enjoy the open space.",
        quick_areas="Quick Areas",
        tasks_eyebrow="DAILY FOCUS",
        tasks_title="Tasks",
        new_task="New",
        search="Search by title",
        progress="PROGRESS",
        active_left="0 active tasks left.",
        no_match="No matching tasks",
        no_match_body="Change the search or create a new focus point.",
        history_eyebrow="HISTORY",
        history_title="Task Journal",
        history_subtitle="See completed and missed days together.",
        missed="Missed",
        no_history="No history yet",
        no_history_body="Completed tasks and renewed daily tasks will appear here.",
        areas_eyebrow="EDIT",
        areas_title="Areas",
        areas_subtitle="Categories keep the day easier to read.",
        active_task="active task",
        add_area="Add Area",
        category_name="CATEGORY NAME",
        create_category="Create Category",
        full_name="FULL NAME",
        title_label="TITLE",
        save_profile="Save Profile",
        premium="Premium",
        premium_body="Review the plan for unlimited tasks and advanced insights.",
        go_premium="Go Premium",
        notifications="Notifications",
        notifications_body="Use device notifications for task reminders.",
        language_en="English",
        language_tr="Turkish",
        legal="Legal",
        privacy="Privacy Policy",
        terms="Terms of Use",
        subscription_terms="Subscription Terms",
        support="Support",
        delete_account="Delete Account and Data",
        logout="Log Out",
        profile_name="Metin ATILGAN",
        profile_email="fnbmtn@hotmail.com",
        profile_initials="ME",
        profile_value="metin ATILGAN",
        profile_title_value="",
        trial="3 Days Free",
        choose_plan="Choose your plan",
        monthly="$2.99 / month",
        yearly="$29.99 / year",
        restore="Restore Purchases",
        features=("Unlimited tasks", "Daily recurring routines", "Completed and missed task history"),
        area_names=("Health", "Work", "Personal"),
    ),
}


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size=size)
    except OSError:
        return ImageFont.load_default()


def sc(value: int | float, scale: float) -> int:
    return int(round(value * scale))


def text_lines(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words = text.split()
    if not words:
        return [""]

    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=face) <= width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    size: int,
    fill=INK,
    bold: bool = False,
    width: int | None = None,
    line_gap: int = 8,
    center: bool = False,
) -> int:
    face = font(size, bold)
    x, y = xy
    lines = [text] if width is None else text_lines(draw, text, face, width)
    line_height = int(size * 1.22)
    for index, line in enumerate(lines):
        tx = x
        if center and width is not None:
            tx = x + int((width - draw.textlength(line, font=face)) / 2)
        draw.text((tx, y + index * (line_height + line_gap)), line, font=face, fill=fill)
    return y + len(lines) * line_height + max(0, len(lines) - 1) * line_gap


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill, outline=LINE, width: int = 2) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def shadow(base: Image.Image, box: tuple[int, int, int, int], radius: int, scale: float, alpha: int = 22, blur: int = 28) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer_draw = ImageDraw.Draw(layer)
    x1, y1, x2, y2 = box
    y_offset = sc(10, scale)
    layer_draw.rounded_rectangle((x1, y1 + y_offset, x2, y2 + y_offset), radius=radius, fill=(28, 44, 66, alpha))
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(sc(blur, scale))))


def card(base: Image.Image, draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, scale: float, fill=SURFACE, outline=LINE) -> None:
    shadow(base, box, radius, scale)
    rounded(draw, box, radius, fill=fill, outline=outline, width=max(1, sc(1.5, scale)))


def background(width: int, height: int) -> Image.Image:
    return Image.new("RGBA", (width, height), PAPER + (255,))


def paste_icon(base: Image.Image, box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = box
    size = x2 - x1
    if ICON.exists():
        icon = Image.open(ICON).convert("RGBA").resize((size, size), Image.LANCZOS)
        base.alpha_composite(icon, (x1, y1))
        return

    draw = ImageDraw.Draw(base)
    rounded(draw, box, max(8, size // 5), fill=PRIMARY, outline=None, width=0)
    draw.line((x1 + size * 0.22, y1 + size * 0.54, x1 + size * 0.43, y1 + size * 0.72, x1 + size * 0.78, y1 + size * 0.26), fill=(255, 255, 255), width=max(4, size // 12))


def draw_status_bar(draw: ImageDraw.ImageDraw, w: int, scale: float) -> None:
    y = sc(28, scale)
    draw_text(draw, (sc(86, scale), y), "16:10", sc(24, scale), fill=INK, bold=True)
    right = w - sc(88, scale)
    draw_text(draw, (right - sc(155, scale), y), "4G", sc(22, scale), fill=INK, bold=True)
    draw.rounded_rectangle((right - sc(82, scale), y + sc(4, scale), right - sc(18, scale), y + sc(30, scale)), radius=sc(8, scale), outline=INK, width=max(2, sc(2, scale)))
    rounded(draw, (right - sc(75, scale), y + sc(10, scale), right - sc(28, scale), y + sc(24, scale)), sc(5, scale), fill=SUCCESS, outline=SUCCESS, width=0)
    draw.rectangle((right - sc(12, scale), y + sc(13, scale), right - sc(7, scale), y + sc(22, scale)), fill=INK)


def draw_plus_button(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], scale: float) -> None:
    rounded(draw, box, sc(22, scale), fill=PRIMARY, outline=PRIMARY, width=0)
    x1, y1, x2, y2 = box
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2
    draw.line((cx - sc(16, scale), cy, cx + sc(16, scale), cy), fill=(255, 255, 255), width=sc(4, scale))
    draw.line((cx, cy - sc(16, scale), cx, cy + sc(16, scale)), fill=(255, 255, 255), width=sc(4, scale))


def draw_tab_icon(draw: ImageDraw.ImageDraw, kind: str, center: tuple[int, int], color, scale: float) -> None:
    cx, cy = center
    size = sc(28, scale)
    width = max(2, sc(3, scale))
    if kind == "today":
        draw.ellipse((cx - size // 2, cy - size // 2, cx + size // 2, cy + size // 2), outline=color, width=width)
        draw.ellipse((cx - sc(7, scale), cy - sc(7, scale), cx + sc(7, scale), cy + sc(7, scale)), fill=color)
    elif kind == "tasks":
        for offset in (-10, 0, 10):
            y = cy + sc(offset, scale)
            draw.line((cx - sc(17, scale), y, cx - sc(7, scale), y + sc(7, scale)), fill=color, width=width)
            draw.line((cx - sc(7, scale), y + sc(7, scale), cx + sc(18, scale), y - sc(8, scale)), fill=color, width=width)
    elif kind == "history":
        draw.arc((cx - size // 2, cy - size // 2, cx + size // 2, cy + size // 2), 35, 330, fill=color, width=width)
        draw.line((cx - sc(14, scale), cy - sc(13, scale), cx - sc(22, scale), cy - sc(13, scale)), fill=color, width=width)
        draw.line((cx, cy, cx, cy - sc(12, scale)), fill=color, width=width)
        draw.line((cx, cy, cx + sc(10, scale), cy + sc(7, scale)), fill=color, width=width)
    elif kind == "areas":
        draw.rectangle((cx - sc(18, scale), cy - sc(8, scale), cx + sc(18, scale), cy + sc(15, scale)), outline=color, width=width)
        draw.rectangle((cx - sc(18, scale), cy - sc(16, scale), cx - sc(2, scale), cy - sc(8, scale)), outline=color, width=width)
    else:
        for offset in (-12, 0, 12):
            y = cy + sc(offset, scale)
            draw.line((cx - sc(20, scale), y, cx + sc(20, scale), y), fill=color, width=width)
        draw.ellipse((cx - sc(4, scale), cy - sc(16, scale), cx + sc(4, scale), cy - sc(8, scale)), fill=color)
        draw.ellipse((cx + sc(7, scale), cy - sc(4, scale), cx + sc(15, scale), cy + sc(4, scale)), fill=color)
        draw.ellipse((cx - sc(15, scale), cy + sc(8, scale), cx - sc(7, scale), cy + sc(16, scale)), fill=color)


def draw_tabs(base: Image.Image, draw: ImageDraw.ImageDraw, copy: Copy, active: str, scale: float) -> None:
    w, h = base.size
    bar_w = min(sc(1660, scale), w - sc(128, scale))
    bar_h = sc(130, scale)
    x1 = (w - bar_w) // 2
    y1 = h - sc(172, scale)
    box = (x1, y1, x1 + bar_w, y1 + bar_h)
    card(base, draw, box, sc(48, scale), scale, fill=(255, 255, 255, 238), outline=LINE)

    keys = ("today", "tasks", "history", "areas", "profile")
    step = bar_w / len(keys)
    for index, key in enumerate(keys):
        label = copy.tabs[index]
        cx = int(x1 + step * index + step / 2)
        selected = key == active
        color = PRIMARY_DARK if selected else MUTED
        if selected:
            pill = (cx - sc(88, scale), y1 + sc(13, scale), cx + sc(88, scale), y1 + bar_h - sc(13, scale))
            rounded(draw, pill, sc(34, scale), fill=BLUE_SOFT, outline=BLUE_SOFT, width=0)
        draw_tab_icon(draw, key, (cx, y1 + sc(42, scale)), color, scale)
        face = font(sc(18, scale), bold=selected)
        text_w = draw.textlength(label, font=face)
        draw.text((cx - text_w / 2, y1 + sc(75, scale)), label, font=face, fill=color)


def shell(copy: Copy, active: str, size: tuple[int, int]) -> tuple[Image.Image, ImageDraw.ImageDraw, tuple[int, int, int, int], float]:
    width, height = size
    scale = width / 2064
    base = background(width, height)
    draw = ImageDraw.Draw(base)
    draw_status_bar(draw, width, scale)

    paste_icon(base, (sc(86, scale), sc(92, scale), sc(150, scale), sc(156, scale)))
    title_face = font(sc(34, scale), bold=True)
    title = "TaskAgent"
    title_w = draw.textlength(title, font=title_face)
    draw.text(((width - title_w) / 2, sc(94, scale)), title, font=title_face, fill=INK)
    subtitle_face = font(sc(18, scale), bold=True)
    subtitle_w = draw.textlength(copy.app_subtitle, font=subtitle_face)
    draw.text(((width - subtitle_w) / 2, sc(133, scale)), copy.app_subtitle, font=subtitle_face, fill=MUTED)
    draw_plus_button(draw, (width - sc(186, scale), sc(82, scale), width - sc(104, scale), sc(164, scale)), scale)

    draw_tabs(base, draw, copy, active, scale)
    return base, draw, (sc(120, scale), sc(260, scale), width - sc(120, scale), height - sc(240, scale)), scale


def headline(draw: ImageDraw.ImageDraw, bounds: tuple[int, int, int, int], copy: Copy, eyebrow: str, title: str, subtitle: str, scale: float) -> int:
    x1, y1, x2, _ = bounds
    draw_text(draw, (x1, y1), eyebrow, sc(20, scale), fill=PRIMARY_DARK, bold=True)
    draw_text(draw, (x1, y1 + sc(48, scale)), title, sc(58, scale), fill=INK, width=x2 - x1)
    return draw_text(draw, (x1, y1 + sc(126, scale)), subtitle, sc(26, scale), fill=MUTED, bold=True, width=x2 - x1) + sc(32, scale)


def progress_bar(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], value: float, scale: float) -> None:
    rounded(draw, box, sc(10, scale), fill=(221, 229, 237), outline=(221, 229, 237), width=0)
    if value > 0:
        x1, y1, x2, y2 = box
        rounded(draw, (x1, y1, x1 + int((x2 - x1) * value), y2), sc(10, scale), fill=PRIMARY, outline=PRIMARY, width=0)


def metric(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], number: str, label: str, scale: float) -> None:
    rounded(draw, box, sc(26, scale), fill=(240, 244, 249), outline=(240, 244, 249), width=0)
    x1, y1, _, _ = box
    draw_text(draw, (x1 + sc(30, scale), y1 + sc(28, scale)), number, sc(34, scale), fill=PRIMARY_DARK, bold=True)
    draw_text(draw, (x1 + sc(30, scale), y1 + sc(78, scale)), label, sc(18, scale), fill=INK, bold=True)


def empty_state(base: Image.Image, draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str, body: str, scale: float) -> None:
    card(base, draw, box, sc(34, scale), scale)
    x1, y1, x2, y2 = box
    cx = (x1 + x2) // 2
    icon_y = y1 + sc(54, scale)
    draw.rectangle((cx - sc(18, scale), icon_y, cx + sc(18, scale), icon_y + sc(28, scale)), outline=PRIMARY, width=sc(4, scale))
    draw.rectangle((cx - sc(10, scale), icon_y + sc(28, scale), cx + sc(10, scale), icon_y + sc(34, scale)), fill=PRIMARY)
    title_y = y1 + sc(116, scale)
    draw_text(draw, (x1 + sc(40, scale), title_y), title, sc(28, scale), fill=INK, bold=True, width=x2 - x1 - sc(80, scale), center=True)
    draw_text(draw, (x1 + sc(90, scale), title_y + sc(54, scale)), body, sc(22, scale), fill=MUTED, bold=True, width=x2 - x1 - sc(180, scale), center=True, line_gap=sc(5, scale))


def area_card(base: Image.Image, draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str, copy: Copy, scale: float, index: int) -> None:
    card(base, draw, box, sc(32, scale), scale)
    x1, y1, x2, y2 = box
    color = (PRIMARY, (70, 133, 172), (88, 112, 147))[index % 3]
    if index == 0:
        draw.arc((x1 + sc(30, scale), y1 + sc(32, scale), x1 + sc(70, scale), y1 + sc(72, scale)), 205, 335, fill=color, width=sc(4, scale))
        draw.arc((x1 + sc(66, scale), y1 + sc(32, scale), x1 + sc(106, scale), y1 + sc(72, scale)), 205, 335, fill=color, width=sc(4, scale))
    elif index == 1:
        draw.rectangle((x1 + sc(34, scale), y1 + sc(46, scale), x1 + sc(88, scale), y1 + sc(84, scale)), outline=color, width=sc(4, scale))
        draw.rectangle((x1 + sc(46, scale), y1 + sc(34, scale), x1 + sc(76, scale), y1 + sc(46, scale)), outline=color, width=sc(4, scale))
    else:
        draw.ellipse((x1 + sc(48, scale), y1 + sc(34, scale), x1 + sc(78, scale), y1 + sc(64, scale)), outline=color, width=sc(4, scale))
        draw.arc((x1 + sc(28, scale), y1 + sc(66, scale), x1 + sc(98, scale), y1 + sc(122, scale)), 205, 335, fill=color, width=sc(4, scale))
    draw_text(draw, (x1 + sc(34, scale), y1 + sc(116, scale)), title, sc(30, scale), fill=INK, bold=True)
    draw_text(draw, (x1 + sc(34, scale), y1 + sc(170, scale)), f"0 {copy.active_task}", sc(19, scale), fill=MUTED, bold=True)
    progress_bar(draw, (x1 + sc(34, scale), y2 - sc(58, scale), x2 - sc(34, scale), y2 - sc(42, scale)), 0, scale)


def draw_focus_card(base: Image.Image, draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], copy: Copy, scale: float) -> None:
    card(base, draw, box, sc(36, scale), scale)
    x1, y1, x2, y2 = box
    draw_text(draw, (x1 + sc(46, scale), y1 + sc(38, scale)), copy.focus_flow, sc(20, scale), fill=MUTED, bold=True)
    draw_text(draw, (x1 + sc(46, scale), y1 + sc(92, scale)), "0%", sc(78, scale), fill=INK)
    draw_text(draw, (x2 - sc(360, scale), y1 + sc(26, scale)), "1", sc(220, scale), fill=(241, 244, 248), bold=True)
    draw.ellipse((x2 - sc(220, scale), y1 + sc(86, scale), x2 - sc(108, scale), y1 + sc(198, scale)), fill=BLUE_SOFT)
    bolt_face = font(sc(42, scale), bold=True)
    draw.text((x2 - sc(178, scale), y1 + sc(113, scale)), "⚡", font=bolt_face, fill=PRIMARY_DARK)
    progress_bar(draw, (x1 + sc(46, scale), y1 + sc(238, scale), x2 - sc(46, scale), y1 + sc(258, scale)), 0, scale)
    metric(draw, (x1 + sc(46, scale), y2 - sc(150, scale), x1 + sc(470, scale), y2 - sc(36, scale)), "0/0", copy.completed, scale)
    metric(draw, (x1 + sc(510, scale), y2 - sc(150, scale), x1 + sc(934, scale), y2 - sc(36, scale)), "0", copy.open_tasks, scale)


def draw_today_overview(copy: Copy, size: tuple[int, int]) -> Image.Image:
    base, draw, bounds, scale = shell(copy, "today", size)
    x1, _, x2, _ = bounds
    y = headline(draw, bounds, copy, copy.today_eyebrow, copy.today_title, copy.today_subtitle, scale)
    draw_focus_card(base, draw, (x1, y, x2, y + sc(430, scale)), copy, scale)

    section_y = y + sc(500, scale)
    draw_text(draw, (x1, section_y), copy.today_focus, sc(34, scale), fill=INK, bold=True)
    count = "0 görev" if copy.code == "tr" else "0 tasks"
    count_w = draw.textlength(count, font=font(sc(20, scale), bold=True))
    draw.text((x2 - count_w, section_y + sc(8, scale)), count, font=font(sc(20, scale), bold=True), fill=MUTED)
    empty_state(base, draw, (x1, section_y + sc(70, scale), x2, section_y + sc(315, scale)), copy.no_today, copy.no_today_body, scale)

    quick_y = section_y + sc(390, scale)
    draw_text(draw, (x1, quick_y), copy.quick_areas, sc(34, scale), fill=INK, bold=True)
    gap = sc(36, scale)
    card_w = (x2 - x1 - gap * 2) // 3
    for index, name in enumerate(copy.area_names):
        ax = x1 + index * (card_w + gap)
        area_card(base, draw, (ax, quick_y + sc(70, scale), ax + card_w, quick_y + sc(325, scale)), name, copy, scale, index)
    return base.convert("RGB")


def draw_today_focus(copy: Copy, size: tuple[int, int]) -> Image.Image:
    base, draw, bounds, scale = shell(copy, "today", size)
    x1, y1, x2, _ = bounds
    draw_text(draw, (x1, y1), copy.today_focus, sc(42, scale), fill=INK, bold=True)
    count = "0 görev" if copy.code == "tr" else "0 tasks"
    count_w = draw.textlength(count, font=font(sc(22, scale), bold=True))
    draw.text((x2 - count_w, y1 + sc(12, scale)), count, font=font(sc(22, scale), bold=True), fill=MUTED)
    empty_state(base, draw, (x1, y1 + sc(96, scale), x2, y1 + sc(380, scale)), copy.no_today, copy.no_today_body, scale)

    quick_y = y1 + sc(470, scale)
    draw_text(draw, (x1, quick_y), copy.quick_areas, sc(42, scale), fill=INK, bold=True)
    gap = sc(36, scale)
    card_w = (x2 - x1 - gap * 2) // 3
    for index, name in enumerate(copy.area_names):
        ax = x1 + index * (card_w + gap)
        area_card(base, draw, (ax, quick_y + sc(86, scale), ax + card_w, quick_y + sc(410, scale)), name, copy, scale, index)
    return base.convert("RGB")


def draw_tasks(copy: Copy, size: tuple[int, int]) -> Image.Image:
    base, draw, bounds, scale = shell(copy, "tasks", size)
    x1, y1, x2, _ = bounds
    draw_text(draw, (x1, y1), copy.tasks_eyebrow, sc(20, scale), fill=PRIMARY_DARK, bold=True)
    draw_text(draw, (x1, y1 + sc(48, scale)), copy.tasks_title, sc(70, scale), fill=INK)
    button = (x2 - sc(260, scale), y1 + sc(32, scale), x2, y1 + sc(112, scale))
    rounded(draw, button, sc(26, scale), fill=PRIMARY, outline=PRIMARY, width=0)
    draw.line((button[0] + sc(42, scale), y1 + sc(72, scale), button[0] + sc(78, scale), y1 + sc(72, scale)), fill=(255, 255, 255), width=sc(4, scale))
    draw.line((button[0] + sc(60, scale), y1 + sc(54, scale), button[0] + sc(60, scale), y1 + sc(90, scale)), fill=(255, 255, 255), width=sc(4, scale))
    draw_text(draw, (button[0] + sc(106, scale), y1 + sc(55, scale)), copy.new_task, sc(24, scale), fill=(255, 255, 255), bold=True)

    search_y = y1 + sc(165, scale)
    rounded(draw, (x1, search_y, x2, search_y + sc(100, scale)), sc(45, scale), fill=SURFACE, outline=LINE)
    draw.ellipse((x1 + sc(48, scale), search_y + sc(36, scale), x1 + sc(74, scale), search_y + sc(62, scale)), outline=MUTED, width=sc(4, scale))
    draw.line((x1 + sc(68, scale), search_y + sc(58, scale), x1 + sc(84, scale), search_y + sc(74, scale)), fill=MUTED, width=sc(4, scale))
    draw_text(draw, (x1 + sc(116, scale), search_y + sc(34, scale)), copy.search, sc(24, scale), fill=SUBTLE, bold=True)

    progress_y = search_y + sc(150, scale)
    card(base, draw, (x1, progress_y, x2, progress_y + sc(205, scale)), sc(34, scale), scale)
    draw_text(draw, (x1 + sc(42, scale), progress_y + sc(36, scale)), copy.progress, sc(20, scale), fill=MUTED, bold=True)
    draw_text(draw, (x1 + sc(42, scale), progress_y + sc(88, scale)), copy.active_left, sc(34, scale), fill=MUTED)
    progress_bar(draw, (x1 + sc(42, scale), progress_y + sc(156, scale), x2 - sc(42, scale), progress_y + sc(176, scale)), 0, scale)
    empty_state(base, draw, (x1, progress_y + sc(270, scale), x2, progress_y + sc(570, scale)), copy.no_match, copy.no_match_body, scale)
    return base.convert("RGB")


def draw_history(copy: Copy, size: tuple[int, int]) -> Image.Image:
    base, draw, bounds, scale = shell(copy, "history", size)
    x1, _, x2, _ = bounds
    y = headline(draw, bounds, copy, copy.history_eyebrow, copy.history_title, copy.history_subtitle, scale)
    gap = sc(36, scale)
    stat_w = (x2 - x1 - gap) // 2
    metric(draw, (x1, y, x1 + stat_w, y + sc(150, scale)), "0", copy.completed, scale)
    metric(draw, (x1 + stat_w + gap, y, x2, y + sc(150, scale)), "0", copy.missed, scale)
    empty_state(base, draw, (x1, y + sc(220, scale), x2, y + sc(540, scale)), copy.no_history, copy.no_history_body, scale)
    return base.convert("RGB")


def draw_areas(copy: Copy, size: tuple[int, int], editor_first: bool = False) -> Image.Image:
    base, draw, bounds, scale = shell(copy, "areas", size)
    x1, y1, x2, _ = bounds
    y = headline(draw, bounds, copy, copy.areas_eyebrow, copy.areas_title, copy.areas_subtitle, scale) if not editor_first else y1
    gap = sc(36, scale)
    card_w = (x2 - x1 - gap * 2) // 3
    for index, name in enumerate(copy.area_names):
        ax = x1 + index * (card_w + gap)
        area_card(base, draw, (ax, y, ax + card_w, y + sc(330, scale)), name, copy, scale, index)

    form_y = y + sc(415, scale)
    card(base, draw, (x1, form_y, x2, form_y + sc(390, scale)), sc(34, scale), scale)
    draw_text(draw, (x1 + sc(42, scale), form_y + sc(42, scale)), copy.add_area, sc(34, scale), fill=INK, bold=True)
    draw_text(draw, (x1 + sc(42, scale), form_y + sc(112, scale)), copy.category_name, sc(18, scale), fill=MUTED, bold=True)
    rounded(draw, (x1 + sc(42, scale), form_y + sc(152, scale), x2 - sc(42, scale), form_y + sc(236, scale)), sc(24, scale), fill=SOFT, outline=LINE)
    rounded(draw, (x1 + sc(42, scale), form_y + sc(270, scale), x2 - sc(42, scale), form_y + sc(350, scale)), sc(24, scale), fill=PRIMARY, outline=PRIMARY, width=0)
    label = copy.create_category
    face = font(sc(24, scale), bold=True)
    label_w = draw.textlength(label, font=face)
    draw.rectangle((x1 + (x2 - x1) // 2 - sc(150, scale), form_y + sc(298, scale), x1 + (x2 - x1) // 2 - sc(125, scale), form_y + sc(322, scale)), fill=(255, 255, 255))
    draw.text(((x1 + x2) / 2 - label_w / 2 + sc(18, scale), form_y + sc(294, scale)), label, font=face, fill=(255, 255, 255))
    return base.convert("RGB")


def draw_input(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], label: str, value: str, scale: float) -> None:
    x1, y1, x2, y2 = box
    draw_text(draw, (x1, y1), label, sc(18, scale), fill=MUTED, bold=True)
    rounded(draw, (x1, y1 + sc(38, scale), x2, y2), sc(24, scale), fill=SOFT, outline=LINE)
    if value:
        draw_text(draw, (x1 + sc(32, scale), y1 + sc(62, scale)), value, sc(24, scale), fill=MUTED)


def profile_header(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], copy: Copy, scale: float) -> None:
    x1, y1, x2, _ = box
    avatar = sc(170, scale)
    cx = (x1 + x2) // 2
    draw.ellipse((cx - avatar // 2, y1, cx + avatar // 2, y1 + avatar), fill=BLUE_SOFT)
    face = font(sc(46, scale), bold=True)
    initials_w = draw.textlength(copy.profile_initials, font=face)
    draw.text((cx - initials_w / 2, y1 + sc(58, scale)), copy.profile_initials, font=face, fill=PRIMARY_DARK)
    name_face = font(sc(50, scale))
    name_w = draw.textlength(copy.profile_name, font=name_face)
    draw.text((cx - name_w / 2, y1 + sc(210, scale)), copy.profile_name, font=name_face, fill=INK)
    mail_face = font(sc(24, scale), bold=True)
    mail_w = draw.textlength(copy.profile_email, font=mail_face)
    draw.text((cx - mail_w / 2, y1 + sc(286, scale)), copy.profile_email, font=mail_face, fill=MUTED)


def draw_premium_panel(base: Image.Image, draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], copy: Copy, scale: float) -> None:
    card(base, draw, box, sc(34, scale), scale)
    x1, y1, x2, _ = box
    draw_text(draw, (x1 + sc(42, scale), y1 + sc(38, scale)), copy.premium, sc(34, scale), fill=INK, bold=True)
    draw_text(draw, (x1 + sc(42, scale), y1 + sc(92, scale)), copy.premium_body, sc(22, scale), fill=MUTED, bold=True, width=x2 - x1 - sc(84, scale), line_gap=sc(4, scale))
    rounded(draw, (x1 + sc(42, scale), y1 + sc(184, scale), x2 - sc(42, scale), y1 + sc(264, scale)), sc(24, scale), fill=PRIMARY, outline=PRIMARY, width=0)
    face = font(sc(24, scale), bold=True)
    text_w = draw.textlength(copy.go_premium, font=face)
    draw.text(((x1 + x2) / 2 - text_w / 2, y1 + sc(208, scale)), copy.go_premium, font=face, fill=(255, 255, 255))


def draw_profile(copy: Copy, size: tuple[int, int]) -> Image.Image:
    base, draw, bounds, scale = shell(copy, "profile", size)
    x1, y1, x2, _ = bounds
    profile_header(draw, (x1, y1, x2, y1 + sc(340, scale)), copy, scale)
    y = y1 + sc(390, scale)
    gap = sc(36, scale)
    col_w = (x2 - x1 - gap) // 2
    card(base, draw, (x1, y, x1 + col_w, y + sc(430, scale)), sc(34, scale), scale)
    draw_input(draw, (x1 + sc(42, scale), y + sc(42, scale), x1 + col_w - sc(42, scale), y + sc(142, scale)), copy.full_name, copy.profile_value, scale)
    draw_input(draw, (x1 + sc(42, scale), y + sc(184, scale), x1 + col_w - sc(42, scale), y + sc(284, scale)), copy.title_label, copy.profile_title_value, scale)
    rounded(draw, (x1 + sc(42, scale), y + sc(324, scale), x1 + col_w - sc(42, scale), y + sc(390, scale)), sc(24, scale), fill=PRIMARY, outline=PRIMARY, width=0)
    label_face = font(sc(22, scale), bold=True)
    label_w = draw.textlength(copy.save_profile, font=label_face)
    draw.text((x1 + col_w / 2 - label_w / 2, y + sc(344, scale)), copy.save_profile, font=label_face, fill=(255, 255, 255))
    draw_premium_panel(base, draw, (x1 + col_w + gap, y, x2, y + sc(320, scale)), copy, scale)
    return base.convert("RGB")


def legal_button(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], label: str, scale: float, danger: bool = False) -> None:
    fill = DANGER if danger else SOFT
    text_color = PRIMARY_DARK if not danger else PRIMARY_DARK
    rounded(draw, box, sc(22, scale), fill=fill, outline=fill, width=0)
    face = font(sc(22, scale), bold=True)
    text_w = draw.textlength(label, font=face)
    draw.text(((box[0] + box[2]) / 2 - text_w / 2, box[1] + sc(23, scale)), label, font=face, fill=text_color)


def draw_profile_settings(copy: Copy, size: tuple[int, int]) -> Image.Image:
    base, draw, bounds, scale = shell(copy, "profile", size)
    x1, y1, x2, _ = bounds
    gap = sc(36, scale)
    col_w = (x2 - x1 - gap) // 2
    draw_premium_panel(base, draw, (x1, y1 + sc(20, scale), x1 + col_w, y1 + sc(330, scale)), copy, scale)

    card(base, draw, (x1 + col_w + gap, y1 + sc(20, scale), x2, y1 + sc(330, scale)), sc(34, scale), scale)
    nx = x1 + col_w + gap
    draw_text(draw, (nx + sc(42, scale), y1 + sc(58, scale)), copy.notifications, sc(34, scale), fill=INK, bold=True)
    draw_text(draw, (nx + sc(42, scale), y1 + sc(112, scale)), copy.notifications_body, sc(22, scale), fill=MUTED, bold=True, width=col_w - sc(170, scale), line_gap=sc(4, scale))
    toggle = (x2 - sc(176, scale), y1 + sc(74, scale), x2 - sc(58, scale), y1 + sc(122, scale))
    rounded(draw, toggle, sc(24, scale), fill=BLUE_SOFT, outline=BLUE_SOFT, width=0)
    draw.ellipse((toggle[2] - sc(46, scale), toggle[1] + sc(4, scale), toggle[2] - sc(4, scale), toggle[3] - sc(4, scale)), fill=SURFACE)
    legal_button(draw, (nx + sc(42, scale), y1 + sc(195, scale), nx + sc(245, scale), y1 + sc(272, scale)), copy.language_en, scale)
    legal_button(draw, (nx + sc(270, scale), y1 + sc(195, scale), nx + sc(470, scale), y1 + sc(272, scale)), copy.language_tr, scale)

    card(base, draw, (x1, y1 + sc(400, scale), x2, y1 + sc(860, scale)), sc(34, scale), scale)
    draw_text(draw, (x1 + sc(42, scale), y1 + sc(438, scale)), copy.legal, sc(34, scale), fill=INK, bold=True)
    labels = (copy.privacy, copy.terms, copy.subscription_terms, copy.support, copy.delete_account)
    row_gap = sc(24, scale)
    row_h = sc(76, scale)
    y = y1 + sc(510, scale)
    for index, label in enumerate(labels):
        row_top = y + index * (row_h + row_gap)
        legal_button(draw, (x1 + sc(42, scale), row_top, x2 - sc(42, scale), row_top + row_h), label, scale, danger=index == len(labels) - 1)
    legal_button(draw, (x1, y1 + sc(925, scale), x2, y1 + sc(1010, scale)), copy.logout, scale, danger=True)
    return base.convert("RGB")


def draw_premium(copy: Copy, size: tuple[int, int]) -> Image.Image:
    base, draw, bounds, scale = shell(copy, "profile", size)
    x1, y1, x2, _ = bounds
    card(base, draw, (x1, y1 + sc(20, scale), x2, y1 + sc(1030, scale)), sc(44, scale), scale)
    draw_text(draw, (x1 + sc(70, scale), y1 + sc(90, scale)), copy.premium, sc(60, scale), fill=INK, bold=True)
    draw_text(draw, (x1 + sc(70, scale), y1 + sc(175, scale)), copy.trial, sc(42, scale), fill=PRIMARY_DARK, bold=True)
    draw_text(draw, (x1 + sc(70, scale), y1 + sc(245, scale)), copy.premium_body, sc(28, scale), fill=MUTED, bold=True, width=x2 - x1 - sc(140, scale), line_gap=sc(6, scale))
    draw_text(draw, (x1 + sc(70, scale), y1 + sc(360, scale)), copy.choose_plan, sc(30, scale), fill=INK, bold=True)
    plan_y = y1 + sc(430, scale)
    for index, (name, price) in enumerate((("Monthly" if copy.code == "en" else "Aylık", copy.monthly), ("Yearly" if copy.code == "en" else "Yıllık", copy.yearly))):
        top = plan_y + index * sc(135, scale)
        rounded(draw, (x1 + sc(70, scale), top, x2 - sc(70, scale), top + sc(104, scale)), sc(28, scale), fill=SOFT if index == 0 else SURFACE, outline=PRIMARY if index == 0 else LINE, width=sc(3 if index == 0 else 2, scale))
        draw_text(draw, (x1 + sc(110, scale), top + sc(33, scale)), name, sc(28, scale), fill=INK, bold=True)
        price_face = font(sc(26, scale), bold=True)
        price_w = draw.textlength(price, font=price_face)
        draw.text((x2 - sc(110, scale) - price_w, top + sc(35, scale)), price, font=price_face, fill=PRIMARY_DARK)
    feature_y = plan_y + sc(310, scale)
    for index, feature in enumerate(copy.features):
        cy = feature_y + index * sc(62, scale)
        draw.ellipse((x1 + sc(78, scale), cy, x1 + sc(108, scale), cy + sc(30, scale)), fill=SUCCESS)
        draw.line((x1 + sc(85, scale), cy + sc(15, scale), x1 + sc(95, scale), cy + sc(24, scale), x1 + sc(103, scale), cy + sc(8, scale)), fill=(255, 255, 255), width=sc(3, scale))
        draw_text(draw, (x1 + sc(128, scale), cy - sc(4, scale)), feature, sc(24, scale), fill=INK, bold=True)
    rounded(draw, (x1 + sc(70, scale), y1 + sc(850, scale), x2 - sc(70, scale), y1 + sc(930, scale)), sc(26, scale), fill=PRIMARY, outline=PRIMARY, width=0)
    label = copy.go_premium
    face = font(sc(26, scale), bold=True)
    label_w = draw.textlength(label, font=face)
    draw.text(((x1 + x2) / 2 - label_w / 2, y1 + sc(875, scale)), label, font=face, fill=(255, 255, 255))
    restore_w = draw.textlength(copy.restore, font=font(sc(22, scale), bold=True))
    draw.text(((x1 + x2) / 2 - restore_w / 2, y1 + sc(955, scale)), copy.restore, font=font(sc(22, scale), bold=True), fill=PRIMARY_DARK)
    return base.convert("RGB")


SCREENS = (
    ("01-today-overview", draw_today_overview),
    ("02-tasks", draw_tasks),
    ("03-history", draw_history),
    ("04-areas", draw_areas),
    ("05-profile", draw_profile),
    ("06-profile-settings", draw_profile_settings),
    ("07-premium", draw_premium),
    ("08-today-focus", draw_today_focus),
    ("09-area-editor", lambda copy, size: draw_areas(copy, size, editor_first=True)),
)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for size_key, size in IPAD_SIZES.items():
        for copy in COPIES.values():
            target = OUT / size_key / copy.code
            target.mkdir(parents=True, exist_ok=True)
            for filename, builder in SCREENS:
                image = builder(copy, size)
                image.save(target / f"{filename}.png", optimize=True)

    ZIP_PATH.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for image_path in sorted(OUT.rglob("*.png")):
            archive.write(image_path, image_path.relative_to(OUT.parent))


if __name__ == "__main__":
    main()
