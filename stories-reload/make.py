#!/usr/bin/env python3
"""Gera o carrossel de feed (5 posts, 1080x1350, formato 4:5) da minha programação no Reload Sebrae Aracaju.

Uso (a partir da raiz do repositório ou de qualquer lugar):
    pip install pillow cairosvg fonttools brotli
    python3 stories-reload/make.py

Entradas opcionais (se faltarem, o layout se adapta):
    photos/<slug>.png   fotos dos palestrantes
    reload-logo.png     logo do evento
"""
from pathlib import Path
import io
import os

from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(os.environ.get("STORIES_OUT", ROOT / "stories-reload"))
FONT_CACHE = ROOT / "stories-reload" / ".fonts"
PHOTOS = Path(os.environ.get("STORIES_PHOTOS", ROOT / "photos"))
RELOAD_LOGO = Path(os.environ.get("STORIES_RELOAD_LOGO", ROOT / "reload-logo.png"))

W, H = 1080, 1350
SAFE_TOP, SAFE_BOTTOM = 80, 80  # margens de cima e de baixo
MX = 72  # margem lateral

CREAM = "#fffceb"
BLACK = "#0e0f0b"
GREEN = "#457528"
GREEN_DARK = "#1f4905"
LIME = "#defa9a"
RULE = "#ddd9c5"
GREY = "#606050"

PHOTO = 150
PHOTO_GAP = 12
LOGO_H = 70          # altura do logo do Reload
BUOVAI_H = 56        # altura do wordmark da Buovai
LOGO_CY = SAFE_TOP + LOGO_H // 2  # centro vertical comum dos logos


# ---------------------------------------------------------------- fontes
def ttf(name):
    """Converte assets/fonts/<name>.woff2 para TTF (em cache) e devolve o caminho."""
    FONT_CACHE.mkdir(parents=True, exist_ok=True)
    dst = FONT_CACHE / f"{name}.ttf"
    if not dst.exists():
        from fontTools.ttLib import TTFont
        f = TTFont(ROOT / "assets" / "fonts" / f"{name}.woff2")
        f.flavor = None
        f.save(dst)
    return str(dst)


_fonts = {}


def font(family, weight, size):
    key = (family, weight, size)
    if key not in _fonts:
        fname = {"u": "unbounded", "j": "plus-jakarta-sans"}[family]
        _fonts[key] = ImageFont.truetype(ttf(f"{fname}-{weight}"), size)
    return _fonts[key]


# ---------------------------------------------------------------- texto
def text_h(f):
    """Altura de linha baseada em ascender+descender."""
    a, d = f.getmetrics()
    return a + d


def wrap(text, f, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = f"{cur} {w}".strip()
        if f.getlength(t) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def tracked_len(text, f, tracking):
    return sum(f.getlength(c) for c in text) + tracking * (len(text) - 1)


def draw_tracked(d, xy, text, f, fill, tracking):
    x, y = xy
    for c in text:
        d.text((x, y), c, font=f, fill=fill)
        x += f.getlength(c) + tracking


# ---------------------------------------------------------------- imagens
def svg_logo(path, height):
    import cairosvg
    png = cairosvg.svg2png(url=str(path), output_width=2000)
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    w = round(im.width * height / im.height)
    return im.resize((w, height), Image.LANCZOS)


def png_logo(path, height):
    im = Image.open(path).convert("RGBA")
    bbox = im.getchannel("A").getbbox()
    if bbox:
        im = im.crop(bbox)
    w = round(im.width * height / im.height)
    return im.resize((w, height), Image.LANCZOS)


# Enquadramento de cada foto: (centro x do rosto, centro y do rosto, lado do recorte),
# em fração da largura (x, lado) e da altura (y) da imagem original.
# Fotos sem entrada aqui usam o recorte padrão (centro/topo).
FOCUS = {
    "borja": (0.52, 0.26, 0.55), "branco": (0.48, 0.21, 0.55),
    "danvelly": (0.42, 0.26, 0.64), "diretoria": (0.48, 0.24, 0.55),
    "gil": (0.50, 0.28, 0.60), "keven": (0.52, 0.22, 0.55),
    "kiso": (0.51, 0.18, 0.55), "rapha": (0.51, 0.28, 0.55),
    "rene": (0.52, 0.18, 0.42), "sacani": (0.51, 0.20, 0.58),
    "tonin": (0.50, 0.27, 0.60), "tony": (0.52, 0.36, 0.72),
}


def circle_photo(slug, size=PHOTO):
    p = PHOTOS / f"{slug}.png"
    if not p.exists():
        return None
    im = Image.open(p).convert("RGB")
    w, h = im.size
    if slug in FOCUS:
        cx, cy, z = FOCUS[slug]
        side = min(z * w, w, h)
        x0 = min(max(0, cx * w - side / 2), w - side)
        y0 = min(max(0, cy * h - side * 0.42), h - side)  # rosto um pouco acima do centro
    else:
        side = min(w, h)
        x0 = (w - side) / 2
        y0 = (h - side) * 0.2
    im = im.crop((round(x0), round(y0), round(x0 + side), round(y0 + side)))
    im = im.resize((size, size), Image.LANCZOS)
    ss = 4
    mask = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * ss - 1, size * ss - 1), fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask.resize((size, size), Image.LANCZOS))
    return out


def tint(im, color):
    """Pinta um logo monocromático numa cor só, mantendo a transparência."""
    solid = Image.new("RGBA", im.size, color)
    solid.putalpha(im.getchannel("A"))
    return solid


def paste_logos(img, dark_bg):
    """Buovai à esquerda, Reload à direita, centralizados no mesmo eixo vertical."""
    d = ImageDraw.Draw(img)
    logo = svg_logo(ROOT / "brand" / ("logo-wordmark-light.svg" if dark_bg else "logo-wordmark-dark.svg"), BUOVAI_H)
    img.alpha_composite(logo, (MX, LOGO_CY - logo.height // 2))
    if RELOAD_LOGO.exists():
        # o logo do Reload é branco: creme no fundo verde, preto no fundo creme
        r = tint(png_logo(RELOAD_LOGO, LOGO_H), CREAM if dark_bg else BLACK)
        img.alpha_composite(r, (W - MX - r.width, LOGO_CY - r.height // 2))
    else:
        f = font("j", 600, 26)
        t = "Reload Sebrae Aracaju"
        bb = d.textbbox((0, 0), t, font=f)
        d.text((W - MX - bb[2], LOGO_CY - (bb[1] + bb[3]) / 2), t, font=f,
               fill=CREAM if dark_bg else BLACK)
    return SAFE_TOP + LOGO_H


# ---------------------------------------------------------------- story 1
def cover():
    bg = Image.open(ROOT / "brand" / "grad-page0.png").convert("RGB")
    bg = bg.rotate(90, expand=True).resize((W, H), Image.LANCZOS)
    bg = ImageEnhance.Brightness(bg).enhance(0.6)
    img = bg.convert("RGBA")
    d = ImageDraw.Draw(img)
    paste_logos(img, dark_bg=True)

    lines = ["Minha", "programação", "no Reload", "Aracaju"]
    size = 132
    while max(font("u", 700, size).getlength(l) for l in lines) > W - 2 * MX:
        size -= 2
    ft = font("u", 700, size)
    lh = round(size * 1.12)
    fs = font("j", 500, 40)
    title_h = lh * len(lines)
    block_h = title_h + 56 + text_h(fs) * 2 + 12
    y = round(H * 0.5 - block_h / 2) + 40
    for l in lines:
        d.text((MX, y), l, font=ft, fill=CREAM)
        y += lh
    y += 56
    d.text((MX, y), "27 e 28 de novembro · AM Malls", font=fs, fill=CREAM)
    y += text_h(fs) + 12
    d.text((MX, y), "Tecnologia, IA e conteúdo.", font=fs, fill=LIME)

    ff = font("j", 700, 44)
    t = "Quem vai? Me chama."
    bb = d.textbbox((0, 0), t, font=ff)
    d.text((MX, H - SAFE_BOTTOM - bb[3]), t, font=ff, fill=LIME)
    return img


# ---------------------------------------------------------------- posts 2-5
TIME_X = MX
TEXT_X = 268
RIGHT = W - MX
COL_GAP = 28
PAD = 22              # respiro mínimo acima/abaixo do conteúdo da linha


def row_layout(item, title_size):
    """Mede uma linha e devolve dicionário com tudo que é preciso para desenhar."""
    photos = [p for p in (circle_photo(s) for s in item.get("photos", [])) if p]
    photos_w = len(photos) * PHOTO + max(0, len(photos) - 1) * PHOTO_GAP
    text_w = RIGHT - TEXT_X - (photos_w + COL_GAP if photos else 0)

    ft = font("j", 700, title_size)
    fsp = font("j", 500, 27)
    far = font("j", 700, 19)
    title_lines = wrap(item["title"], ft, text_w)
    sp_lines = wrap(item["speaker"], fsp, text_w)
    lh_t = round(title_size * 1.22)
    lh_s = round(27 * 1.35)
    h = lh_t * len(title_lines) + 10 + lh_s * len(sp_lines)
    if item.get("arena"):
        h += 12 + text_h(far)
    content_h = max(h, PHOTO if photos else 0)
    return dict(item=item, photos=photos, photos_w=photos_w, text_w=text_w,
                ft=ft, fsp=fsp, far=far, title_lines=title_lines, sp_lines=sp_lines,
                lh_t=lh_t, lh_s=lh_s, text_h=h, content_h=content_h)


def day_story(day, sub, items):
    img = Image.new("RGBA", (W, H), CREAM)
    d = ImageDraw.Draw(img)
    y = paste_logos(img, dark_bg=False) + 52

    flab = font("j", 700, 22)
    draw_tracked(d, (MX, y), "RELOAD ARACAJU · AM MALLS", flab, GREEN, 4.5)
    y += text_h(flab) + 14
    fday = font("u", 600, 72)
    d.text((MX, y), day, font=fday, fill=BLACK)
    y += text_h(fday) + 4
    if sub:
        fsub = font("j", 600, 30)
        d.text((MX, y), sub, font=fsub, fill=GREEN)
        y += text_h(fsub)
    top = y + 32
    bottom = H - SAFE_BOTTOM

    # Maior tamanho de título em que todos cabem em até 2 linhas e o conjunto cabe na área.
    # Se apertar, reduz primeiro o respiro mínimo e depois o tamanho do título.
    def fit():
        for size in range(38, 27, -1):
            rows = [row_layout(it, size) for it in items]
            if any(len(r["title_lines"]) > 2 for r in rows):
                continue
            for pad in range(PAD, 7, -2):
                total = sum(r["content_h"] + 2 * pad for r in rows)
                if total <= bottom - top:
                    return rows, pad, total
        raise SystemExit(f"{day}: conteúdo não cabe — reduza textos")

    rows, pad, total = fit()

    spare = (bottom - top - total) / len(rows)
    ftime = font("u", 500, 40)
    y = top
    for r in rows:
        rh = r["content_h"] + 2 * pad + spare
        d.line((MX, round(y), RIGHT, round(y)), fill=RULE, width=2)
        cy = y + rh / 2
        ty = cy - r["text_h"] / 2  # bloco de texto centralizado na linha
        it = r["item"]

        # horário alinhado ao topo das letras do título
        tb = d.textbbox((0, 0), it["time"], font=ftime)
        title_top = d.textbbox((0, 0), "H", font=r["ft"])[1]
        d.text((TIME_X, ty + title_top - tb[1]), it["time"], font=ftime, fill=BLACK)

        yy = ty
        for l in r["title_lines"]:
            d.text((TEXT_X, yy), l, font=r["ft"], fill=BLACK)
            yy += r["lh_t"]
        yy += 10
        for l in r["sp_lines"]:
            d.text((TEXT_X, yy), l, font=r["fsp"], fill=GREY)
            yy += r["lh_s"]
        if it.get("arena"):
            yy += 12
            draw_tracked(d, (TEXT_X, yy), it["arena"].upper(), r["far"], GREEN, 3)

        px = RIGHT - r["photos_w"]
        for p in r["photos"]:
            img.alpha_composite(p, (px, round(cy - PHOTO / 2)))
            px += PHOTO + PHOTO_GAP
        y += rh
    return img


# ---------------------------------------------------------------- conteúdo
STORY2 = [
    dict(time="19:00", title="Abertura do Sebrae", speaker="Diretoria do Sebrae/SE",
         arena="Arena Futuro", photos=["diretoria"]),
    dict(time="19:30", title="Aplicação da IA nos negócios", speaker="Sérgio Sacani",
         arena="Arena Futuro", photos=["sacani"]),
    dict(time="20:30", title="Empreender em Sergipe e criação de comunidades",
         speaker="Gusttavo Garcia e Felipe Garcêz", arena="Arena Conexão",
         photos=["gusttavo", "felipe"]),
]
STORY3 = [
    dict(time="09:00", title="Human Skills na era de I.A", speaker="Borja Castelar",
         arena="Arena Conexão", photos=["borja"]),
    dict(time="10:00", title="ChatGPT na prática", speaker="Keven Teles",
         arena="Arena Aplicação", photos=["keven"]),
    dict(time="11:00", title="Storytelling em vídeo", speaker="Daniel Danvelly",
         arena="Arena Criatividade", photos=["danvelly"]),
    dict(time="12:00", title="Pausa para o almoço", speaker="Até 13:30"),
]
STORY4 = [
    dict(time="13:30", title="O novo mapa das mídias sociais", speaker="Rafael Kiso",
         arena="Arena Futuro", photos=["kiso"]),
    dict(time="14:30", title="Conteúdo que vende", speaker="Rapha Falcão",
         arena="Arena Futuro", photos=["rapha"]),
    dict(time="15:30", title="Você aparece, a empresa cresce", speaker="Marcus Tonin",
         arena="Arena Conexão", photos=["tonin"]),
]
STORY5 = [
    dict(time="16:30*", title="Marketing e vendas de alto impacto",
         speaker="Rene Soares e Tony Tonete", arena="Arena Aplicação",
         photos=["rene", "tony"]),
    dict(time="17:30", title="A melhor estratégia de marketing do mundo", speaker="João Branco",
         arena="Arena Futuro", photos=["branco"]),
    dict(time="18:30", title="Muito além do like", speaker="Gil do Vigor",
         arena="Arena Futuro", photos=["gil"]),
]


def save(img, name):
    path = OUT / name
    img.convert("RGB").save(path, optimize=True)
    print("ok", path)


if __name__ == "__main__":
    missing = [s for st in (STORY2, STORY3, STORY4, STORY5) for it in st for s in it.get("photos", [])
               if not (PHOTOS / f"{s}.png").exists()]
    if missing:
        print("fotos ausentes (linha só com texto):", ", ".join(missing))
    if not RELOAD_LOGO.exists():
        print("reload-logo.png ausente: usando texto")
    save(cover(), "post-1-capa.png")
    save(day_story("Sexta, 27/11", None, STORY2), "post-2-sexta.png")
    save(day_story("Sábado, 28/11", "Manhã", STORY3), "post-3-sabado-manha.png")
    save(day_story("Sábado, 28/11", "Tarde", STORY4), "post-4-sabado-tarde.png")
    save(day_story("Sábado, 28/11", "Tarde · *horário a confirmar", STORY5), "post-5-sabado-fim-de-tarde.png")
