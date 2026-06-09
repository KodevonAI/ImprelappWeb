#!/usr/bin/env python3
"""Generates all Elementor JSON templates for Imprelapp WordPress site."""

import json, random, string, os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "templates")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Design tokens — flat vars for safe use inside f-strings
CP  = "#08428C"   # primary
CS  = "#034C8C"   # secondary
CL  = "#EEF4FF"   # light blue tint
CBG = "#F8FAFC"   # page background
CSF = "#FFFFFF"   # surface / card
CT  = "#0F172A"   # text dark
CM  = "#475569"   # text muted
CBR = "#E2E8F0"   # border
CW  = "#FFFFFF"   # white
CDH = "#051D40"   # dark hero

FONT = "Inter"

def uid():
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=7))

def section(settings, elements, css=""):
    return {"id": uid(), "elType": "section",
            "settings": {**settings, "css_classes": css}, "elements": elements}

def col(size, elements, extra=None):
    s = {"_column_size": size}
    if extra: s.update(extra)
    return {"id": uid(), "elType": "column", "settings": s, "elements": elements}

def w(wtype, settings):
    return {"id": uid(), "elType": "widget", "widgetType": wtype,
            "settings": settings, "elements": []}

def h_w(text_val, tag="h2", color=CP, size=38, weight="700", align="left", mb=24, mob=None):
    return w("heading", {
        "title": text_val, "header_size": tag, "align": align,
        "title_color": color,
        "typography_font_family": FONT,
        "typography_font_size": {"size": size, "unit": "px"},
        "typography_font_size_mobile": {"size": mob or max(20, size - 12), "unit": "px"},
        "typography_font_weight": weight,
        "_margin": {"top":"0","right":"0","bottom":str(mb),"left":"0","unit":"px","isLinked":False},
    })

def txt(html, mb=0):
    return w("text-editor", {
        "editor": html,
        "_margin": {"top":"0","right":"0","bottom":str(mb),"left":"0","unit":"px","isLinked":False},
    })

def html_w(html_str):
    return w("html", {"html": html_str})

def sc(code):
    return w("shortcode", {"shortcode": code})

def icon_box(icon, title, desc, icon_color=CP, title_color=CP, pos="top", align="center"):
    return w("icon-box", {
        "selected_icon": {"value": icon, "library": "fa-solid"},
        "title_text": title, "description_text": desc,
        "icon_color": icon_color, "title_color": title_color,
        "description_color": CM, "position": pos, "content_align": align,
        "icon_size": {"size": 38, "unit": "px"},
        "title_typography_font_family": FONT, "title_typography_font_weight": "700",
        "title_typography_font_size": {"size": 15, "unit": "px"},
        "description_typography_font_family": FONT,
        "description_typography_font_size": {"size": 13, "unit": "px"},
    })

def divider_line(mb=32):
    return w("divider", {
        "color": CP, "weight": {"size": 3, "unit": "px"},
        "width": {"size": 60, "unit": "px"}, "align": "left",
        "_margin": {"top":"0","right":"0","bottom":str(mb),"left":"0","unit":"px","isLinked":False},
    })

def sec_settings(pt=80, pb=80, bg=CSF, css=""):
    return {
        "background_background": "classic", "background_color": bg,
        "padding": {"top":str(pt),"right":"30","bottom":str(pb),"left":"30","unit":"px","isLinked":False},
        "css_classes": css,
    }

def write_template(fname, title, content, layout="elementor_full_width"):
    tpl = {
        "version": "0.4", "title": title, "type": "page",
        "content": content,
        "page_settings": {"hide_title": "yes", "page_layout": layout},
    }
    path = os.path.join(OUTPUT_DIR, fname)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(tpl, f, ensure_ascii=False, indent=2)
    kb = os.path.getsize(path) // 1024
    print(f"  OK  {fname:35s}  {kb}KB")

# ─────────────────────────────────────────────────────────────────────────────
# HOME PAGE
# ─────────────────────────────────────────────────────────────────────────────
def make_home():
    hero = section({
        "background_background": "classic", "background_color": CDH,
        "height": "100vh", "content_position": "middle",
        "stretch_section": "section-stretched",
        "padding": {"top":"100","right":"30","bottom":"100","left":"30","unit":"px","isLinked":False},
    }, [col(100, [
        w("image", {
            "image": {"url": "REEMPLAZAR_URL_LOGO", "alt": "Imprelapp"},
            "align": "center", "image_size": "medium",
            "width": {"size": 200, "unit": "px"},
            "_margin": {"top":"0","right":"0","bottom":"28","left":"0","unit":"px","isLinked":False},
        }),
        h_w("Rodamientos, Piñones,<br>Correas y Ferretería",
            tag="h1", color=CW, size=54, align="center", mb=16, mob=30),
        txt(f"<p style='text-align:center;color:#C8DEFF;font-family:Inter,sans-serif;"
            f"font-size:18px;line-height:1.7;'>Distribuidores industriales con más de 20 años "
            f"de experiencia.<br>Soluciones de transmisión de potencia para toda Colombia.</p>", mb=36),
        html_w(
            f'<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">'
            f'<a href="/tienda" style="display:inline-block;background:{CW};color:{CP};'
            f'font-family:Inter,sans-serif;font-weight:700;font-size:15px;padding:15px 40px;'
            f'border-radius:6px;text-decoration:none;">Ver Catálogo</a>'
            f'<a href="https://wa.me/57REEMPLAZAR_NUMERO" target="_blank" style="display:inline-block;'
            f'background:transparent;color:{CW};border:2px solid {CW};font-family:Inter,sans-serif;'
            f'font-weight:600;font-size:15px;padding:13px 38px;border-radius:6px;text-decoration:none;">'
            f'Cotizar por WhatsApp</a></div>'
        ),
    ], {"content_position": "middle"})])

    stats = section({
        "background_background": "classic", "background_color": CP,
        "padding": {"top":"36","right":"30","bottom":"36","left":"30","unit":"px","isLinked":False},
    }, [
        col(25, [icon_box("fas fa-calendar-alt", "20+ Años", "En el mercado industrial", CW, CW)]),
        col(25, [icon_box("fas fa-users", "3.000+ Clientes", "Industria, talleres, construcción", CW, CW)]),
        col(25, [icon_box("fas fa-boxes", "50.000+ Referencias", "Rodamientos, piñones, correas", CW, CW)]),
        col(25, [icon_box("fas fa-map-marker-alt", "Cobertura Nacional", "Despachos a todo Colombia", CW, CW)]),
    ])

    cats = section(sec_settings(80, 80, CBG), [
        col(100, [
            h_w("Nuestras Categorías", color=CP, size=36, align="center", mb=10),
            txt(f"<p style='text-align:center;color:{CM};font-family:Inter,sans-serif;font-size:16px;'>"
                f"Encuentra todo lo que tu industria necesita</p>", mb=48),
            html_w(
                f'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;">'
                + "".join([
                    f'<a href="/categoria-producto/{slug}" style="text-decoration:none;">'
                    f'<div style="background:{CSF};border:1px solid {CBR};border-radius:10px;'
                    f'padding:32px 24px;text-align:center;transition:box-shadow .2s;">'
                    f'<div style="width:56px;height:56px;background:{CL};border-radius:50%;'
                    f'display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">'
                    f'<span style="font-size:26px;">{icon}</span></div>'
                    f'<h3 style="font-family:Inter,sans-serif;font-weight:700;color:{CP};'
                    f'font-size:17px;margin:0 0 8px;">{name}</h3>'
                    f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:13px;margin:0;">{brands}</p>'
                    f'</div></a>'
                    for name, slug, icon, brands in [
                        ("Rodamientos", "rodamientos", "⚙️", "SKF · FAG · NSK · Timken"),
                        ("Piñones y Sprockets", "pinones", "🔩", "Taper Lock · Cadena · Dentado"),
                        ("Correas de Transmisión", "correas", "📿", "Gates · Optibelt · Bando"),
                        ("Ferretería Industrial", "ferreteria", "🔧", "Tornillería · Sellantes · Herramientas"),
                    ]
                ])
                + "</div>"
            ),
        ]),
    ])

    products = section(sec_settings(80, 80, CSF, "productos"), [
        col(100, [
            h_w("Productos Destacados", color=CP, size=36, align="center", mb=10),
            txt(f"<p style='text-align:center;color:{CM};font-family:Inter,sans-serif;font-size:16px;'>"
                f"Los más solicitados por nuestros clientes industriales</p>", mb=40),
            sc('[products limit="8" columns="4" orderby="popularity" order="DESC"]'),
            html_w(
                f'<div style="text-align:center;margin-top:40px;">'
                f'<a href="/tienda" style="display:inline-block;background:{CP};color:{CW};'
                f'font-family:Inter,sans-serif;font-weight:700;font-size:15px;padding:14px 40px;'
                f'border-radius:6px;text-decoration:none;">Ver Todo el Catálogo</a></div>'
            ),
        ]),
    ])

    why = section(sec_settings(80, 80, CBG), [
        col(100, [
            h_w("¿Por qué elegir Imprelapp?", color=CP, size=34, align="center", mb=8),
            txt(f"<p style='text-align:center;color:{CM};font-family:Inter,sans-serif;font-size:16px;'>"
                f"Más de dos décadas respaldando a la industria colombiana</p>", mb=48),
        ]),
        col(33, [icon_box("fas fa-certificate", "Marcas Originales",
            "Distribuidores autorizados de SKF, FAG, Gates, NSK, Timken, Optibelt y más.")]),
        col(33, [icon_box("fas fa-truck", "Despacho Inmediato",
            "Pedidos en Bogotá: 24h. Envíos a todo el país en 2–5 días hábiles.")]),
        col(33, [icon_box("fas fa-headset", "Asesoría Técnica",
            "Ingenieros especializados te ayudan a encontrar el producto exacto.")]),
    ])

    brands = section({
        "background_background": "classic", "background_color": CSF,
        "padding": {"top":"50","right":"30","bottom":"50","left":"30","unit":"px","isLinked":False},
        "border_border": "solid", "border_color": CBR,
        "border_width": {"top":"1","right":"0","bottom":"1","left":"0","unit":"px","isLinked":False},
    }, [col(100, [
        txt(f"<p style='text-align:center;color:{CM};font-family:Inter,sans-serif;"
            f"font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;"
            f"margin-bottom:24px;'>MARCAS QUE DISTRIBUIMOS</p>"),
        html_w(
            f'<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:24px 44px;">'
            + "".join([
                f'<span style="font-family:Inter,sans-serif;font-weight:800;font-size:19px;'
                f'color:#94A3B8;letter-spacing:1px;">{b}</span>'
                for b in ["SKF", "FAG", "NSK", "GATES", "TIMKEN", "OPTIBELT", "BANDO", "REXNORD"]
            ])
            + "</div>"
        ),
    ])])

    cta = section({
        "background_background": "classic", "background_color": CP,
        "padding": {"top":"70","right":"30","bottom":"70","left":"30","unit":"px","isLinked":False},
    }, [
        col(66, [
            h_w("¿Necesitas una cotización?", tag="h2", color=CW, size=32, mb=12),
            txt(f"<p style='color:#C8DEFF;font-family:Inter,sans-serif;font-size:16px;line-height:1.7;'>"
                f"Escríbenos con el código de referencia o describe tu aplicación.<br>"
                f"Respuesta en menos de 2 horas en días hábiles.</p>"),
        ]),
        col(33, [html_w(
            f'<div style="text-align:center;">'
            f'<a href="https://wa.me/57REEMPLAZAR_NUMERO?text=Hola%2C%20necesito%20cotizaci%C3%B3n" '
            f'target="_blank" style="display:block;background:{CW};color:{CP};'
            f'font-family:Inter,sans-serif;font-weight:700;font-size:15px;padding:15px 32px;'
            f'border-radius:6px;text-decoration:none;margin-bottom:12px;">💬 WhatsApp</a>'
            f'<a href="/contacto" style="display:block;background:transparent;color:{CW};'
            f'border:2px solid {CW};font-family:Inter,sans-serif;font-weight:600;font-size:15px;'
            f'padding:13px 32px;border-radius:6px;text-decoration:none;">Formulario de Contacto</a>'
            f'</div>'
        )]),
    ])

    return [hero, stats, cats, products, why, brands, cta]


# ─────────────────────────────────────────────────────────────────────────────
# NOSOTROS
# ─────────────────────────────────────────────────────────────────────────────
def make_about():
    hero = section({
        "background_background": "classic", "background_color": CDH,
        "padding": {"top":"80","right":"30","bottom":"80","left":"30","unit":"px","isLinked":False},
    }, [col(100, [
        h_w("Sobre Imprelapp", tag="h1", color=CW, size=46, align="center", mb=16),
        txt(f"<p style='text-align:center;color:#C8DEFF;font-family:Inter,sans-serif;font-size:17px;'>"
            f"Más de 20 años distribuyendo soluciones de transmisión de potencia en Colombia</p>"),
    ])])

    story = section(sec_settings(80, 80, CSF), [
        col(55, [
            h_w("Nuestra Historia", color=CP, size=32, mb=16),
            divider_line(),
            txt(f'<p style="color:{CM};font-family:Inter,sans-serif;font-size:15px;line-height:1.8;margin-bottom:16px;">'
                f'Imprelapp nació en 2004 como una pequeña ferretería industrial en Bogotá, Colombia. '
                f'Fundada con la visión de brindar soluciones confiables de transmisión de potencia '
                f'al sector industrial colombiano.</p>'
                f'<p style="color:{CM};font-family:Inter,sans-serif;font-size:15px;line-height:1.8;margin-bottom:16px;">'
                f'Con el paso de los años nos consolidamos como distribuidores autorizados de las marcas '
                f'más reconocidas del mercado: SKF, FAG, Gates, NSK, Timken, Optibelt y Rexnord. '
                f'Cada marca representa un estándar de calidad que respaldamos con garantía.</p>'
                f'<p style="color:{CM};font-family:Inter,sans-serif;font-size:15px;line-height:1.8;">'
                f'Hoy atendemos a más de 3.000 clientes activos en todo el país, desde talleres artesanales '
                f'hasta grandes plantas industriales del sector minero, agroindustrial y manufacturero. '
                f'Nuestro equipo técnico es nuestro mayor activo.</p>'),
        ]),
        col(45, [html_w(
            f'<div style="background:{CBG};border-radius:12px;padding:40px;border-left:4px solid {CP};">'
            f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;">'
            + "".join([
                f'<div style="text-align:center;">'
                f'<div style="font-family:Inter,sans-serif;font-weight:800;font-size:36px;color:{CP};line-height:1;">{num}</div>'
                f'<div style="font-family:Inter,sans-serif;font-size:13px;color:{CM};margin-top:6px;">{label}</div>'
                f'</div>'
                for num, label in [
                    ("2004", "Año de fundación"), ("3.000+", "Clientes activos"),
                    ("50.000+", "Referencias en stock"), ("8", "Marcas autorizadas"),
                ]
            ])
            + "</div></div>"
        )]),
    ])

    mv = section(sec_settings(70, 70, CBG), [
        col(50, [html_w(
            f'<div style="background:{CSF};border-radius:10px;padding:36px;border:1px solid {CBR};height:100%;">'
            f'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
            f'<div style="width:40px;height:40px;background:{CP};border-radius:8px;display:flex;'
            f'align-items:center;justify-content:center;color:white;font-size:18px;">🎯</div>'
            f'<h3 style="font-family:Inter,sans-serif;font-weight:700;color:{CP};font-size:20px;margin:0;">Misión</h3>'
            f'</div>'
            f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:15px;line-height:1.8;margin:0;">'
            f'Proveer soluciones confiables de transmisión de potencia y ferretería industrial, '
            f'garantizando calidad, disponibilidad y asesoría técnica especializada para mantener '
            f'operando la industria colombiana.</p></div>'
        )]),
        col(50, [html_w(
            f'<div style="background:{CSF};border-radius:10px;padding:36px;border:1px solid {CBR};height:100%;">'
            f'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
            f'<div style="width:40px;height:40px;background:{CP};border-radius:8px;display:flex;'
            f'align-items:center;justify-content:center;color:white;font-size:18px;">🔭</div>'
            f'<h3 style="font-family:Inter,sans-serif;font-weight:700;color:{CP};font-size:20px;margin:0;">Visión</h3>'
            f'</div>'
            f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:15px;line-height:1.8;margin:0;">'
            f'Ser el distribuidor industrial de referencia en Colombia, reconocidos por nuestra '
            f'expertise técnica, cobertura nacional y el compromiso con el éxito operacional '
            f'de cada uno de nuestros clientes.</p></div>'
        )]),
    ])

    values = section(sec_settings(70, 70, CSF), [
        col(100, [
            h_w("Nuestros Valores", color=CP, size=32, align="center", mb=8),
            txt(f"<p style='text-align:center;color:{CM};font-family:Inter,sans-serif;font-size:15px;'>"
                f"Los principios que guían cada decisión</p>", mb=48),
        ]),
        col(25, [icon_box("fas fa-handshake", "Confianza",
            "Relaciones duraderas basadas en honestidad y cumplimiento.")]),
        col(25, [icon_box("fas fa-star", "Calidad",
            "Solo distribuimos productos originales de marcas certificadas.")]),
        col(25, [icon_box("fas fa-bolt", "Agilidad",
            "Tu tiempo de producción es nuestro compromiso.")]),
        col(25, [icon_box("fas fa-microscope", "Expertise",
            "Equipo con formación en ingeniería mecánica e industrial.")]),
    ])

    cta = section({
        "background_background": "classic", "background_color": CP,
        "padding": {"top":"60","right":"30","bottom":"60","left":"30","unit":"px","isLinked":False},
    }, [col(100, [
        h_w("¿Quieres trabajar con nosotros?", color=CW, size=30, align="center", mb=12),
        txt(f"<p style='text-align:center;color:#C8DEFF;font-family:Inter,sans-serif;font-size:16px;'>"
            f"Contáctanos para cotizaciones, distribución o alianzas comerciales</p>", mb=28),
        html_w(
            f'<div style="text-align:center;">'
            f'<a href="/contacto" style="display:inline-block;background:{CW};color:{CP};'
            f'font-family:Inter,sans-serif;font-weight:700;font-size:15px;padding:15px 44px;'
            f'border-radius:6px;text-decoration:none;">Contáctanos</a></div>'
        ),
    ])])

    return [hero, story, mv, values, cta]


# ─────────────────────────────────────────────────────────────────────────────
# CONTACTO
# ─────────────────────────────────────────────────────────────────────────────
def make_contact():
    hero = section({
        "background_background": "classic", "background_color": CDH,
        "padding": {"top":"70","right":"30","bottom":"70","left":"30","unit":"px","isLinked":False},
    }, [col(100, [
        h_w("Contáctanos", tag="h1", color=CW, size=44, align="center", mb=14),
        txt(f"<p style='text-align:center;color:#C8DEFF;font-family:Inter,sans-serif;font-size:17px;'>"
            f"Cotizaciones, soporte técnico y pedidos — respondemos en menos de 2 horas</p>"),
    ])])

    cards = section(sec_settings(70, 70, CBG), [
        col(33, [html_w(
            f'<div style="background:{CSF};border-radius:10px;padding:32px 24px;text-align:center;'
            f'border:1px solid {CBR};border-top:4px solid {CP};">'
            f'<div style="font-size:34px;margin-bottom:14px;">📞</div>'
            f'<h3 style="font-family:Inter,sans-serif;font-weight:700;color:{CP};font-size:17px;margin:0 0 8px;">Teléfono / WhatsApp</h3>'
            f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:14px;margin:0 0 4px;">+57 REEMPLAZAR_NUMERO</p>'
            f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:13px;margin:0;">Lun–Vie 8am–6pm · Sáb 8am–1pm</p>'
            f'</div>'
        )]),
        col(33, [html_w(
            f'<div style="background:{CSF};border-radius:10px;padding:32px 24px;text-align:center;'
            f'border:1px solid {CBR};border-top:4px solid {CP};">'
            f'<div style="font-size:34px;margin-bottom:14px;">✉️</div>'
            f'<h3 style="font-family:Inter,sans-serif;font-weight:700;color:{CP};font-size:17px;margin:0 0 8px;">Correo Electrónico</h3>'
            f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:14px;margin:0 0 4px;">ventas@imprelapp.com</p>'
            f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:13px;margin:0;">cotizaciones@imprelapp.com</p>'
            f'</div>'
        )]),
        col(33, [html_w(
            f'<div style="background:{CSF};border-radius:10px;padding:32px 24px;text-align:center;'
            f'border:1px solid {CBR};border-top:4px solid {CP};">'
            f'<div style="font-size:34px;margin-bottom:14px;">📍</div>'
            f'<h3 style="font-family:Inter,sans-serif;font-weight:700;color:{CP};font-size:17px;margin:0 0 8px;">Dirección</h3>'
            f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:14px;margin:0 0 4px;">REEMPLAZAR_DIRECCIÓN</p>'
            f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:13px;margin:0;">Bogotá, Colombia</p>'
            f'</div>'
        )]),
    ])

    form_sec = section(sec_settings(70, 80, CSF), [
        col(60, [
            h_w("Envíanos tu Cotización", color=CP, size=28, mb=8),
            txt(f'<p style="color:{CM};font-family:Inter,sans-serif;font-size:15px;margin-bottom:28px;">'
                f'Déjanos tus datos y la referencia del producto. Te respondemos con precio y disponibilidad.</p>'),
            sc('[contact-form-7 id="REEMPLAZAR_ID_CF7" title="Cotización Imprelapp"]'),
            txt(f'<p style="color:{CM};font-family:Inter,sans-serif;font-size:12px;margin-top:12px;">'
                f'Requiere plugin Contact Form 7 instalado y activado.</p>'),
        ]),
        col(40, [html_w(
            f'<div style="background:{CBG};border-radius:10px;padding:32px;border:1px solid {CBR};">'
            f'<h3 style="font-family:Inter,sans-serif;font-weight:700;color:{CP};font-size:18px;margin:0 0 20px;">Horario de Atención</h3>'
            + "".join([
                f'<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid {CBR};">'
                f'<span style="font-family:Inter,sans-serif;color:{CT};font-size:14px;">{day}</span>'
                f'<span style="font-family:Inter,sans-serif;color:{CM};font-size:14px;">{hrs}</span>'
                f'</div>'
                for day, hrs in [
                    ("Lunes – Viernes", "8:00 am – 6:00 pm"),
                    ("Sábado", "8:00 am – 1:00 pm"),
                    ("Domingo", "Cerrado"),
                ]
            ])
            + f'<div style="margin-top:20px;padding:14px;background:{CL};border-radius:8px;">'
            f'<p style="font-family:Inter,sans-serif;font-size:13px;color:{CP};margin:0;font-weight:600;">Pedidos urgentes</p>'
            f'<p style="font-family:Inter,sans-serif;font-size:13px;color:{CM};margin:6px 0 0;">'
            f'WhatsApp disponible para emergencias industriales fuera de horario.</p>'
            f'</div></div>'
        )]),
    ])

    map_ph = section({
        "background_background": "classic", "background_color": CBR,
        "padding": {"top":"0","right":"0","bottom":"0","left":"0","unit":"px","isLinked":True},
    }, [col(100, [html_w(
        f'<div style="width:100%;height:350px;background:{CBG};display:flex;'
        f'align-items:center;justify-content:center;border-top:4px solid {CP};">'
        f'<div style="text-align:center;">'
        f'<div style="font-size:44px;margin-bottom:12px;">🗺️</div>'
        f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:15px;">'
        f'Agrega aquí un widget Google Maps de Elementor o un iframe de Google Maps</p>'
        f'</div></div>'
    )])])

    return [hero, cards, form_sec, map_ph]


# ─────────────────────────────────────────────────────────────────────────────
# CART
# ─────────────────────────────────────────────────────────────────────────────
def make_cart():
    hero = section({
        "background_background": "classic", "background_color": CDH,
        "padding": {"top":"50","right":"30","bottom":"50","left":"30","unit":"px","isLinked":False},
    }, [col(100, [
        html_w(
            f'<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;">'
            f'<a href="/" style="color:#94A3B8;font-family:Inter,sans-serif;font-size:13px;text-decoration:none;">Inicio</a>'
            f'<span style="color:#64748B;font-size:13px;">›</span>'
            f'<span style="color:{CW};font-family:Inter,sans-serif;font-size:13px;">Carrito</span>'
            f'</div>'
        ),
        h_w("Tu Carrito de Compras", tag="h1", color=CW, size=38, align="center", mb=0),
    ])])

    cart_body = section(sec_settings(50, 70, CBG), [
        col(100, [
            html_w(
                f'<div style="background:{CL};border:1px solid {CBR};border-radius:8px;'
                f'padding:14px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;">'
                f'<span style="font-size:18px;">ℹ️</span>'
                f'<p style="font-family:Inter,sans-serif;font-size:14px;color:{CP};margin:0;">'
                f'Los precios incluyen IVA cuando aplica. El envío se calcula al finalizar la compra.</p>'
                f'</div>'
            ),
            sc("[woocommerce_cart]"),
        ]),
    ])

    trust = section({
        "background_background": "classic", "background_color": CL,
        "padding": {"top":"28","right":"30","bottom":"28","left":"30","unit":"px","isLinked":False},
        "border_border": "solid", "border_color": CBR,
        "border_width": {"top":"1","right":"0","bottom":"0","left":"0","unit":"px","isLinked":False},
    }, [
        col(25, [icon_box("fas fa-lock", "Pago Seguro", "SSL + MercadoPago certificado", CP, CP, "left", "left")]),
        col(25, [icon_box("fas fa-truck", "Envío Colombia", "2–5 días hábiles", CP, CP, "left", "left")]),
        col(25, [icon_box("fas fa-undo", "Productos Originales", "Garantía de autenticidad", CP, CP, "left", "left")]),
        col(25, [icon_box("fas fa-headset", "Soporte Técnico", "Asesoría especializada", CP, CP, "left", "left")]),
    ])

    return [hero, cart_body, trust]


# ─────────────────────────────────────────────────────────────────────────────
# CHECKOUT
# ─────────────────────────────────────────────────────────────────────────────
def make_checkout():
    hero = section({
        "background_background": "classic", "background_color": CDH,
        "padding": {"top":"44","right":"30","bottom":"44","left":"30","unit":"px","isLinked":False},
    }, [col(100, [
        html_w(
            f'<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;">'
            f'<a href="/" style="color:#94A3B8;font-family:Inter,sans-serif;font-size:13px;text-decoration:none;">Inicio</a>'
            f'<span style="color:#64748B;">›</span>'
            f'<a href="/carrito" style="color:#94A3B8;font-family:Inter,sans-serif;font-size:13px;text-decoration:none;">Carrito</a>'
            f'<span style="color:#64748B;">›</span>'
            f'<span style="color:{CW};font-family:Inter,sans-serif;font-size:13px;">Finalizar Compra</span>'
            f'</div>'
        ),
        h_w("Finalizar Compra", tag="h1", color=CW, size=36, align="center", mb=0),
    ])])

    body = section(sec_settings(50, 70, CBG), [
        col(100, [
            html_w(
                f'<div style="background:{CL};border:1px solid {CBR};border-radius:8px;'
                f'padding:14px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;">'
                f'<span style="font-size:18px;">🔒</span>'
                f'<p style="font-family:Inter,sans-serif;font-size:14px;color:{CP};margin:0;font-weight:600;">'
                f'Pago seguro. Tu información está protegida con encriptación SSL 256 bits.</p>'
                f'</div>'
            ),
            sc("[woocommerce_checkout]"),
        ]),
    ])

    payment_logos = section({
        "background_background": "classic", "background_color": CSF,
        "padding": {"top":"24","right":"30","bottom":"24","left":"30","unit":"px","isLinked":False},
        "border_border": "solid", "border_color": CBR,
        "border_width": {"top":"1","right":"0","bottom":"0","left":"0","unit":"px","isLinked":False},
    }, [col(100, [html_w(
        f'<div style="text-align:center;">'
        f'<p style="font-family:Inter,sans-serif;font-size:12px;color:{CM};margin-bottom:10px;'
        f'font-weight:600;letter-spacing:1px;">MÉTODOS DE PAGO ACEPTADOS</p>'
        f'<div style="display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;">'
        + "".join([
            f'<span style="background:{CBG};border:1px solid {CBR};border-radius:6px;'
            f'padding:7px 14px;font-family:Inter,sans-serif;font-size:12px;font-weight:700;color:{CM};">{m}</span>'
            for m in ["MercadoPago", "PSE", "Tarjeta Crédito", "Tarjeta Débito", "Efecty", "Contra Entrega", "Transferencia"]
        ])
        + "</div></div>"
    )])])

    return [hero, body, payment_logos]


# ─────────────────────────────────────────────────────────────────────────────
# ORDER RECEIVED
# ─────────────────────────────────────────────────────────────────────────────
def make_order_received():
    success = section({
        "background_background": "classic", "background_color": CP,
        "padding": {"top":"60","right":"30","bottom":"60","left":"30","unit":"px","isLinked":False},
    }, [col(100, [html_w(
        f'<div style="text-align:center;">'
        f'<div style="width:72px;height:72px;background:rgba(255,255,255,0.15);border-radius:50%;'
        f'display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px;">'
        f'<span style="color:white;">✓</span></div>'
        f'<h1 style="font-family:Inter,sans-serif;font-weight:800;color:{CW};font-size:38px;margin:0 0 12px;">'
        f'¡Pedido Recibido!</h1>'
        f'<p style="font-family:Inter,sans-serif;color:#C8DEFF;font-size:17px;margin:0;">'
        f'Gracias por tu compra en Imprelapp. Recibirás confirmación por correo electrónico.</p>'
        f'</div>'
    )])])

    detail = section(sec_settings(50, 70, CBG), [
        col(100, [
            sc("[woocommerce_order_received]"),
            html_w(
                f'<div style="background:{CL};border-radius:10px;padding:28px 32px;margin-top:32px;border:1px solid {CBR};">'
                f'<h3 style="font-family:Inter,sans-serif;font-weight:700;color:{CP};font-size:17px;margin:0 0 20px;">¿Qué sigue?</h3>'
                f'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;">'
                + "".join([
                    f'<div style="text-align:center;">'
                    f'<div style="font-size:28px;margin-bottom:8px;">{icon}</div>'
                    f'<p style="font-family:Inter,sans-serif;font-weight:700;color:{CP};font-size:14px;margin:0 0 4px;">{t}</p>'
                    f'<p style="font-family:Inter,sans-serif;color:{CM};font-size:12px;margin:0;">{d}</p>'
                    f'</div>'
                    for icon, t, d in [
                        ("📧", "Confirmación", "Email con detalles del pedido"),
                        ("📦", "Alistamiento", "Preparamos tu pedido en bodega"),
                        ("🚚", "Despacho", "24h Bogotá · 2–5 días Nacional"),
                        ("📞", "Seguimiento", "Te enviamos la guía de envío"),
                    ]
                ])
                + "</div></div>"
            ),
            html_w(
                f'<div style="text-align:center;margin-top:32px;">'
                f'<a href="/tienda" style="display:inline-block;background:{CP};color:{CW};'
                f'font-family:Inter,sans-serif;font-weight:700;font-size:15px;padding:14px 36px;'
                f'border-radius:6px;text-decoration:none;margin-right:12px;">Seguir Comprando</a>'
                f'<a href="/mi-cuenta" style="display:inline-block;background:transparent;color:{CP};'
                f'border:2px solid {CP};font-family:Inter,sans-serif;font-weight:600;font-size:15px;'
                f'padding:12px 28px;border-radius:6px;text-decoration:none;">Ver Mis Pedidos</a>'
                f'</div>'
            ),
        ]),
    ])

    return [success, detail]


# ─────────────────────────────────────────────────────────────────────────────
# SHOP ARCHIVE
# ─────────────────────────────────────────────────────────────────────────────
def make_shop():
    hero = section({
        "background_background": "classic", "background_color": CDH,
        "padding": {"top":"50","right":"30","bottom":"50","left":"30","unit":"px","isLinked":False},
    }, [col(100, [
        h_w("Catálogo de Productos", tag="h1", color=CW, size=40, align="center", mb=12),
        txt(f"<p style='text-align:center;color:#C8DEFF;font-family:Inter,sans-serif;font-size:15px;'>"
            f"Rodamientos · Piñones · Correas · Ferretería Industrial</p>"),
    ])])

    filters = section({
        "background_background": "classic", "background_color": CL,
        "padding": {"top":"18","right":"30","bottom":"18","left":"30","unit":"px","isLinked":False},
        "border_border": "solid", "border_color": CBR,
        "border_width": {"top":"0","right":"0","bottom":"1","left":"0","unit":"px","isLinked":False},
    }, [col(100, [html_w(
        f'<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">'
        f'<span style="font-family:Inter,sans-serif;font-weight:600;color:{CP};font-size:14px;margin-right:4px;">Categorías:</span>'
        + "".join([
            f'<a href="{url}" style="display:inline-block;background:{CSF};color:{CM};border:1px solid {CBR};'
            f'font-family:Inter,sans-serif;font-size:13px;font-weight:500;padding:6px 16px;'
            f'border-radius:20px;text-decoration:none;">{cat}</a>'
            for cat, url in [
                ("Todos", "/tienda"), ("Rodamientos", "/categoria-producto/rodamientos"),
                ("Piñones", "/categoria-producto/pinones"), ("Correas", "/categoria-producto/correas"),
                ("Ferretería", "/categoria-producto/ferreteria"),
            ]
        ])
        + "</div>"
    )])])

    prods = section(sec_settings(50, 80, CBG), [
        col(100, [
            sc('[products limit="12" columns="4" orderby="date" order="DESC" paginate="true"]'),
        ]),
    ])

    return [hero, filters, prods]


# ─────────────────────────────────────────────────────────────────────────────
# SINGLE PRODUCT
# ─────────────────────────────────────────────────────────────────────────────
def make_single():
    bc = section({
        "background_background": "classic", "background_color": CBG,
        "padding": {"top":"14","right":"30","bottom":"14","left":"30","unit":"px","isLinked":False},
        "border_border": "solid", "border_color": CBR,
        "border_width": {"top":"0","right":"0","bottom":"1","left":"0","unit":"px","isLinked":False},
    }, [col(100, [sc("[woocommerce_breadcrumb]")])])

    product = section(sec_settings(50, 60, CSF), [
        col(100, [
            html_w(
                f'<div style="background:{CL};border-radius:8px;padding:16px 20px;border:1px solid {CBR};margin-bottom:24px;">'
                f'<p style="font-family:Inter,sans-serif;font-size:14px;color:{CP};margin:0;font-weight:600;">'
                f'ℹ️ Para personalizar esta página completamente: '
                f'<strong>Elementor → Theme Builder → Single → Crear nueva → Single Product</strong> '
                f'y usa los widgets de WooCommerce (Imagen de producto, Título, Precio, Añadir al carrito, Tabs).</p>'
                f'</div>'
            ),
        ]),
    ])

    guarantee = section({
        "background_background": "classic", "background_color": CL,
        "padding": {"top":"30","right":"30","bottom":"30","left":"30","unit":"px","isLinked":False},
    }, [
        col(25, [icon_box("fas fa-certificate", "Producto Original", "100% auténtico garantizado", CP, CP, "left", "left")]),
        col(25, [icon_box("fas fa-truck", "Envío Express", "Bogotá 24h · Nacional 2–5 días", CP, CP, "left", "left")]),
        col(25, [icon_box("fas fa-phone-alt", "Soporte Técnico", "Consultas de compatibilidad", CP, CP, "left", "left")]),
        col(25, [icon_box("fas fa-file-invoice", "Factura Electrónica", "Facturación incluida", CP, CP, "left", "left")]),
    ])

    related = section(sec_settings(60, 80, CBG), [
        col(100, [
            h_w("Productos Relacionados", color=CP, size=26, mb=32),
            sc('[products limit="4" columns="4" orderby="rand"]'),
        ]),
    ])

    return [bc, product, guarantee, related]


# ─────────────────────────────────────────────────────────────────────────────
# GENERATE ALL FILES
# ─────────────────────────────────────────────────────────────────────────────
print("Generando templates Elementor — Imprelapp\n")

write_template("home-page.json",      "Imprelapp - Inicio",           make_home(),           "elementor_canvas")
write_template("nosotros.json",       "Imprelapp - Nosotros",         make_about(),          "elementor_full_width")
write_template("contacto.json",       "Imprelapp - Contacto",         make_contact(),        "elementor_full_width")
write_template("cart-page.json",      "Imprelapp - Carrito",          make_cart(),           "elementor_full_width")
write_template("checkout.json",       "Imprelapp - Finalizar Compra", make_checkout(),       "elementor_full_width")
write_template("order-received.json", "Imprelapp - Pedido Recibido",  make_order_received(), "elementor_full_width")
write_template("shop-archive.json",   "Imprelapp - Tienda",           make_shop(),           "elementor_full_width")
write_template("single-product.json", "Imprelapp - Producto",         make_single(),         "elementor_full_width")

print(f"\nTodos en: {OUTPUT_DIR}")
print("\nResumen:")
total = 0
for f in sorted(os.listdir(OUTPUT_DIR)):
    if f.endswith(".json"):
        kb = os.path.getsize(os.path.join(OUTPUT_DIR, f)) // 1024
        total += kb
        print(f"  {f:35s}  {kb}KB")
print(f"\n  TOTAL: {total}KB")
