#!/usr/bin/env python3
"""산사캠프 스마트스토어 상세 HTML 생성기.

실행: python3 store-detail/build.py  (레포 루트에서)
결과: store-detail/product-*.html 4개, public/store-detail/preview.html, store-detail/README.md 의 통계 표

문구·가격을 바꿀 때는 이 파일의 텍스트만 고치고 다시 실행하면 4개 상품에 동시에 반영됩니다.
스마트스토어 'HTML 작성' 칸 규칙: script/style/class/iframe/form/position:fixed 금지, 인라인 style 만 사용.
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_BASE = "https://sansacamp.com/store-detail/20261017/"

# ── 미확정 값 (대표님 결정 대기) ─────────────────────────────
ARTIST = "추후 공개"           # 4번 아티스트 (확정 전까지 이름 넣지 않음)
SHOW_TIME_FRI = "19:00 – 20:30"  # 11.6(금) — README '확인 필요'
SHOW_TIME_SAT = "19:00 – 20:30"  # 11.7(토) — 확정

# ── 공통 스타일 ──────────────────────────────────────────
C_GREEN = "#1f3a2c"
C_RED = "#a63c2c"
WRAP = 'style="max-width:860px;margin:0 auto;font-family:sans-serif;line-height:1.7;color:#222;"'
SEC = 'style="padding:28px 20px;margin:0;"'
H3 = f'style="margin:0 0 14px;font-size:22px;line-height:1.4;font-weight:bold;color:{C_GREEN};"'
P = 'style="margin:0 0 8px;font-size:16px;"'
SMALL = 'style="margin:0 0 8px;font-size:14px;color:#555;"'
TABLE = 'style="width:100%;border-collapse:collapse;margin:12px 0 0;font-size:16px;"'
TD_L = 'style="padding:12px 8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top;"'
TD_R = 'style="padding:12px 8px;border-bottom:1px solid #ddd;text-align:right;vertical-align:top;font-weight:bold;white-space:nowrap;"'
LINK = f'style="color:{C_RED};font-weight:bold;text-decoration:none;"'

TEL = f'<a href="tel:0222695002" {LINK}>02-2269-5002</a>'
MAIL = f'<a href="mailto:info@airoon.kr" {LINK}>info@airoon.kr</a>'


def e(s):
    return html.escape(s, quote=False)


def img(file, alt):
    return f'<img src="{IMG_BASE}{file}" alt="{html.escape(alt)}" style="width:100%;display:block;">'


def img_block(file, alt):
    return f'<div style="margin:0;padding:0;">{img(file, alt)}</div>'


def section(title, body, bg="#ffffff"):
    head = f"<h3 {H3}>{title}</h3>" if title else ""
    pad = "28px 20px" if body else "28px 20px 0"
    return f'<div style="padding:{pad};margin:0;background:{bg};">{head}{body}</div>'


def lines(items, style=P):
    return "".join(f"<p {style}>{x}</p>" for x in items)


def price_table(rows):
    trs = "".join(f"<tr><td {TD_L}>{e(a)}</td><td {TD_R}>{e(b)}</td></tr>" for a, b in rows)
    return f"<table {TABLE}>{trs}</table>"


# ══ 섹션별 블록 (구성표 No) ═════════════════════════════════

def s1():
    return img_block("01-poster.jpg",
                     "2026 산사캠프 with 쌍계사 메인 포스터 - 산사에서 즐기는 마인드 디톡스, 하동 쌍계사 일원 캠핑·한옥 템플스테이 2026년 11월 6일~8일")


def s2():
    body = (
        f'<p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:{C_RED};">LOCATION</p>'
        f'<p style="margin:0 0 2px;font-size:16px;color:#555;">지리산 · 천년 고찰</p>'
        f'<p style="margin:0 0 8px;font-size:24px;font-weight:bold;color:{C_GREEN};">하동 쌍계사 일원</p>'
        f"<p {P}>경남 하동군 화개면 쌍계사길 59</p>"
        f"<p {P}><b>2026년 11월 6일(금)~8일(일), 2박 3일</b></p>"
        f'<p style="margin:0;font-size:15px;color:#555;">#차(茶) 시배지 #화개동천 #국보 진감선사대성탑비</p>'
    )
    return img_block("02-location-photos.jpg",
                     "지리산 하동 쌍계사 가을 단풍 사진 - 천년 고찰 쌍계사 구층석탑, 화개동천 계곡, 돌담길 산책") + section("", body)


def s3():
    return img_block("03-date-banner.jpg",
                     "산사캠프 일정 11월 6일(금)~8일(일) 하동 쌍계사 일원 - NO FOMO, JUST FOREST 낮에는 채우고 밤에는 비웁니다")


def s4():
    body = (
        f'<p style="margin:0 0 10px;font-size:18px;font-weight:bold;">FOREST LIVE · 산사의 가을 저녁 공연</p>'
        f"<p {P}>11.6 (금) 산사토크 &amp; 어쿠스틱 나이트</p>"
        f"<p {P}>11.7 (토) 숲속 힐링 콘서트 &amp; 스페셜 토크</p>"
        + (f"<p {P}><b>공연 시간: {SHOW_TIME_SAT}</b></p>" if SHOW_TIME_FRI == SHOW_TIME_SAT else
           f"<p {P}><b>공연 시간: 11.6 (금) {SHOW_TIME_FRI} / 11.7 (토) {SHOW_TIME_SAT}</b></p>")
        + f"<p {P}>아티스트: {ARTIST}</p>"
        + f'<p style="margin:0;font-size:15px;color:#555;">21:00 이후는 고요의 시간입니다.</p>'
    )
    return section("공연 · 아티스트", body, "#f7f2e8")


def s6():
    return section("티켓 판매 안내", lines([
        "– 본 행사는 <b>100% 사전예약제</b>로 운영되며, 현장 판매는 없습니다.",
        "– 판매 규모: <b>캠핑 250동 · 한옥 23실 (최대 700명 한정)</b>",
        "– 공식판매처: (주)아이룬 여행사",
        "– 캠핑존은 1사이트당 최대 4인까지 수용 가능하며, <b>3~4번째 추가 인원은 '추가상품'에서 꼭 선택해 주세요.</b>",
        "– 36개월 미만 무료 (증빙 필수)",
        "– 한정 수량으로 운영되어 판매가 조기 종료될 수 있습니다.",
        "– '차 한잔에 쉼을 담고'는 100명 한정 사전예약 프로그램입니다.",
    ]))


def s7():
    body = (
        f'<p style="margin:0 0 12px;font-size:16px;font-weight:bold;">STEP 1 사전예약 → STEP 2 예약 내역 확인 → STEP 3 입장 팔찌 수령</p>'
        + lines([
            "– 현장에서 예약자 성함·연락처로 예약 내역을 확인한 후 입장 팔찌를 수령합니다.",
            "– 입장 팔찌를 착용해야만 제반 시설 및 식음 이용이 가능합니다.",
            "– 입장 시간: <b>11월 6일(금) 14:00부터</b> (20:00 이전 입장 마감)",
            "– 체크인 &amp; 웰컴키트 수령: 11월 6일(금) 14:00 ~ 16:00",
            "– 체크아웃: <b>11월 8일(일) 11:00</b>",
            "– 차량: 쌍계사 경내 진입 불가. 전용 주차장에 주차 후 도보 또는 카트로 이동",
            "– 주차: 무료 · 사전등록제(1팀 1대) · 미등록 차량 진입 불가",
            f"– 문의: 산사캠프 운영사무국 {TEL} · {MAIL}",
        ])
    )
    return (section("입장 방법 안내", "", "#f7f2e8")
            + img_block("07-entry-steps.jpg", "산사캠프 입장 방법 STEP 1 사전예약, STEP 2 예약 내역 확인, STEP 3 입장 팔찌 수령")
            + section("", body))


def s8():
    body = lines([
        "☆ <b>취소 및 환불은 2026년 11월 1일(일) 24시까지 가능합니다.</b>",
        "☆ 티켓 양도는 직계 가족만 가능하며, 예매자 신분증, 양도자 신분증, 가족관계증명서를 지참하시어 방문하셔야 합니다.",
    ])
    return section("취소 · 환불 · 양도 안내", body, "#f7f2e8")


def s9():
    return img_block("09-price-receipt.jpg",
                     "산사캠프 판매 티켓 및 가격 안내 - 티켓 한 장으로 끝내는 올인클루시브 웰니스, 산사캠프 영수증 사찰공양 9대 힐링 프로그램 산사 라이브 웰컴 기프트 키트 힐링 마켓 현장 추가 결제 0원")


ALL_INCL = "모든 요금은 2박 기준 · 사찰공양 5식 · 전 프로그램 포함 (VAT 포함)"


def s10():
    body = (
        f"<p {P}><b>{ALL_INCL}</b></p>"
        f"<p {P}>캠핑존 1사이트는 2인 기준이며, 최대 4인 이용 가능</p>"
        f"<p {P}><b>1사이트 2인 기준 요금, 1인 이용 시에도 사이트 요금 동일</b></p>"
        + price_table([
            ("캠핑존 1사이트 (2인 입장권 기준)", "380,000원"),
            ("인원 추가요금 (성인, 3·4번째)", "150,000원"),
            ("인원 추가요금 (36개월 이상~미취학아동, 3·4번째)", "100,000원"),
        ])
    )
    return section("캠핑존 가격 안내", body)


def s11():
    body = (
        f'<div style="background:#fff3d6;border:2px solid {C_RED};border-radius:8px;padding:18px 16px;">'
        f'<p style="margin:0 0 10px;font-size:18px;font-weight:bold;color:{C_RED};">[필수 확인] 인원 추가 시 꼭 확인하세요!</p>'
        + lines([
            "1개 사이트당 성인 2인 기준 · 최대 4인 이용 가능",
            "<b>3~4번째 추가 인원은 '추가상품'에서 꼭 선택해 주세요.</b>",
            "※ 36개월 미만 무료 (증빙 필수)",
            "최대 인원(4인)을 넘을 경우 추가 사이트로 예약 부탁드립니다.",
        ])
        + "</div>"
    )
    return section("", body)


def s12():
    body = lines([
        "· 사이트 크기: 가로 3m × 세로 4m (최대 4인)",
        "· 텐트에서는 전기 사용이 불가하니 휴대폰 보조배터리를 준비해 주세요.",
        "· 문화재보호구역이므로 샤워장에서는 비치된 친환경 비누만 사용 가능합니다.",
        "· 주차 무료 · 사전등록제(1팀 1대) · 미등록 차량 진입 불가",
        "· 사전 지정 구역 내 피칭",
        "· <b>사이트는 예약 순서대로 임의 배정됩니다.</b>",
    ])
    return (section("캠핑 사이트 안내", "")
            + img_block("12-site-size.jpg", "산사캠프 캠핑존 사이트 크기 도식 가로 3m × 세로 4m")
            + section("", body))


def s13():
    body = (
        f'<p style="margin:0 0 8px;font-size:18px;font-weight:bold;">Pet &amp; Kids Zone (쌍계초 · 85동)</p>'
        + lines([
            "반려견, 아이와 함께하는 전용 구역입니다.",
            "· 요금은 캠핑존과 동일합니다.",
            "· 펫티켓: 리드줄 필수, 반려동물 대소변은 깔끔하게 수거해 주세요.",
        ])
    )
    return section("Pet &amp; Kids Zone 안내", body, "#f7f2e8")


def s14():
    body = (
        price_table([("감성 텐트 렌탈 풀세트 (4인용)", "130,000원 / 동")])
        + f'<p style="margin:10px 0 0;font-size:15px;color:#555;">텐트, 매트, 감성 캠핑 테이블 및 체어 일체</p>'
    )
    return section("ADD-ON 추가 옵션", body)


def s15():
    return img_block("15-hanok-photos.jpg",
                     "하동 쌍계사 한옥 방사 스테이 사진 - 지리산 능선이 보이는 한옥 마당, 차나무가 반기는 한옥 대문, 숲과 계곡을 품은 방사 템플스테이 객실")


def s16():
    return img_block("16-twin-room-card.jpg",
                     "산사캠프 한옥 2인실 구성 - 전통 한옥 온돌방 2박, 사찰공양 5식, 9대 프로그램 전체 참여, 웰컴 기프트 키트")


def s17(rows):
    body = f"<p {P}><b>{ALL_INCL}</b></p>" + price_table(rows)
    return section("한옥 방사 스테이 가격 안내", body)


HANOK_2TO4 = [
    ("2인실 (2인 기준)", "500,000원"),
    ("3인실 (3인 기준)", "700,000원"),
    ("4인실 (4인 기준)", "900,000원"),
]
HANOK_5TO6 = [
    ("5인실 (5인 기준)", "1,100,000원"),
    ("6인실 (6인 기준 · 최대 8인)", "1,300,000원"),
    ("6인실 7~8번째 인원 추가 (성인)", "150,000원"),
    ("6인실 7~8번째 인원 추가 (36개월 이상~미취학아동)", "100,000원"),
]


def s18(with_6=True):
    # 6인실 안내는 6인실을 파는 5~6인실 상품에만 (2~4인실 상품에는 6인실이 없음)
    body = lines(([
        "– 한옥 스테이 6인실은 최대 8인까지 이용 가능하므로, 추가 인원은 별도 구매 부탁드립니다.",
    ] if with_6 else []) + [
        "– 운영팀에서 예약 확인 후 잘못 예약된 경우 개별 연락드릴 예정입니다.",
    ])
    return section(f'<span style="color:{C_RED};">!</span> 요금 유의사항', body, "#f7f2e8")


def s19():
    body = (
        f"<p {P}>하동군 화개면 쌍계사길 59</p>"
        + price_table([
            ("A 쌍계사 경내 (대웅전 주변)", "30동"),
            ("B 쌍계초 · Pet & Kids Zone", "85동"),
            ("C 주차장 · 언덕", "135동"),
        ])
        + f'<p style="margin:14px 0 4px;font-size:15px;">메인 무대 → 일주문 864m · 12분</p>'
        + f'<p style="margin:0;font-size:15px;">쌍계초 → 일주문 501m · 7분</p>'
    )
    return (img_block("19-site-map.jpg",
                      "산사캠프 행사장 안내도 - 지리산 쌍계사 일원 캠핑존, Pet & Kids Zone, 한옥 방사, 메인 무대, 주차장 지도")
            + section("", body))


PROGRAMS = [
    ("01", "아침을 여는 요가 &amp; 선명상", "매일 07:00", "지리산의 아침 공기와 함께하는 스트레칭과 숲속 선명상",
     "20-program-01-yoga.jpg", "산사캠프 프로그램 01 아침 요가와 선명상 - 쌍계사 경내 숲속 명상"),
    ("02", "싱잉볼 사운드 배스", "", "화개동천 계곡물 소리와 싱잉볼의 맑은 진동으로 하는 사운드 힐링",
     "20-program-02-singing-bowl.jpg", "산사캠프 프로그램 02 싱잉볼 사운드 배스 명상 체험"),
    ("03", "스님과의 즉문즉답 차담", "", "스님과 차 한 잔을 나누며 고민을 내려놓는 시간", None, None),
    ("04", "차 한잔에 쉼을 담고", "100명 한정 사전예약", "차 시배지 하동 쌍계사 차밭에서 즐기는 다도와 차 명상",
     "20-program-04-tea-break.jpg", "산사캠프 프로그램 04 차 한잔에 쉼을 담고 - 쌍계사 시민선방 다도 차 명상, 찻자리와 다과"),
    ("05", "호리병속 별천지 트래킹", "", "국립공원 숲 해설사와 함께 불일폭포 숲길을 걷는 트래킹",
     "20-program-05-trekking.jpg", "산사캠프 프로그램 05 호리병속 별천지 트래킹 - 지리산 불일폭포 숲길"),
    ("06", "사찰음식 다이닝 &amp; 예불 체험", "", "제철 사찰공양과 산사의 저녁 예불",
     "20-program-06-temple-food-yebul.jpg", "산사캠프 프로그램 06 사찰음식 다이닝과 저녁 예불 체험"),
    ("07", "쌍계사 천년 역사 탐방 도슨트", "", "국보 진감선사대성탑비와 대웅전의 역사 투어",
     "20-program-07-docent.jpg", "산사캠프 프로그램 07 쌍계사 천년 역사 탐방 도슨트 투어"),
    ("08", "하동 로컬 산사장터", "", "지리산 야생차, 하동 특산물, 로컬 푸드, 핸드메이드 마켓", None, None),
    ("09", "포레스트 라이브 (산사토크 &amp; 공연)", "", "금·토 가을 저녁 어쿠스틱 라이브 &amp; 아티스트 토크 (21:00 전 종료)",
     "20-program-09-forest-live.jpg", "산사캠프 프로그램 09 포레스트 라이브 산사토크와 공연"),
]


def s20():
    out = section("9대 마인드 디톡스 프로그램",
                  f'<p style="margin:0;font-size:16px;font-weight:bold;color:{C_RED};">현장 추가 결제 0원</p>', "#f7f2e8")
    for no, name, tag, desc, f, alt in PROGRAMS:
        if f:
            out += img_block(f, alt)
        tag_html = f' <span style="font-size:14px;color:{C_RED};">({tag})</span>' if tag else ""
        out += (f'<div style="padding:16px 20px 22px;margin:0;">'
                f'<p style="margin:0 0 4px;font-size:18px;font-weight:bold;">'
                f'<span style="color:{C_RED};">{no}</span> {name}{tag_html}</p>'
                f'<p style="margin:0;font-size:15px;color:#444;">{desc}</p></div>')
    return out


def s21():
    body = (
        f"<p {P}><b>사전예약 기간: 10월 28일(수) ~ 11월 1일(일)</b></p>"
        f"<p {P}>예약 방법: 산사캠프 APP에서 프로그램별 사전예약 (QR 스캔)</p>"
    )
    notes = lines([
        "1. 프로그램별 참여 인원이 제한되어 조기 마감될 수 있습니다.",
        "2. 1인당 예약 가능한 프로그램 수에 제한이 있을 수 있습니다.",
        "3. 프로그램별 운영 시간과 장소를 확인한 후 예약해 주세요.",
        "4. 예약한 프로그램 시간에 맞춰 현장에 도착해 주세요.",
        "5. 예약 취소·변경은 APP 안내를 확인해 주세요.",
    ])
    return (section("프로그램 사전예약 안내", body)
            + img_block("21-program-qr.jpg", "산사캠프 프로그램 사전예약 QR 코드 sansacamp.com")
            + section("", notes))


def s22():
    return (img_block("22-timetable.jpg",
                      "산사캠프 2박 3일 타임테이블 - 11월 6일 체크인, 사찰공양 5식, 요가, 싱잉볼, 트래킹, 다도 명상, 산사토크 공연 19:00–20:30, 11월 8일 11:00 체크아웃")
            + '<div style="padding:12px 20px 20px;margin:0;background:#162b22;">'
              '<p style="margin:0;font-size:14px;color:#e8e2d4;text-align:center;">※ 현장 상황 및 운영 일정에 따라 변동될 수 있습니다.</p></div>')


RULES = [
    ("01", "차량 진입 통제", "쌍계사 경내 차량 진입이 전면 불가합니다. 전용 주차장에 주차 후 도보 또는 카트로 이동해 주세요."),
    ("02", "화기 엄금 (문화재 보호구역)", "모닥불(불멍), 숯불, 펠릿, 화목난로 사용이 엄격히 금지됩니다."),
    ("03", "고요의 시간", "21:00 ~ 06:00에는 전체 소등 및 소음(앰프, 블루투스 스피커 등)이 전면 금지됩니다."),
    ("04", "사전예약 및 입장", "예약자 성함·연락처 확인 후 입장 팔찌를 수령하며, 팔찌 착용 시에만 시설·식음 이용이 가능합니다."),
    ("05", "인원 제한", "사이트 인원 초과 시 다른 캠핑존으로 안내·변경될 수 있습니다."),
    ("06", "산사캠프 에티켓", "사이트 구역 준수, 반려동물 배변 수거, 사이트 내 상업적 홍보 금지, 분리수거로 LNT(Leave No Trace) 실천"),
    ("07", "현장 운영 공지", "일교차가 크고 화기 사용이 제한되니 방한 의류와 침구를 꼭 준비해 주세요. 무단 상업 행위 적발 시 즉시 퇴거 조치됩니다. 현장 스태프의 안내를 따라 주세요."),
]


def s23():
    body = "".join(
        f'<div style="padding:12px 0;border-bottom:1px solid #ddd;">'
        f'<p style="margin:0 0 4px;font-size:17px;font-weight:bold;"><span style="color:{C_RED};">{no}</span> {e(t)}</p>'
        f'<p style="margin:0;font-size:15px;color:#444;">{e(d)}</p></div>'
        for no, t, d in RULES)
    return section("유의사항 &amp; 클린캠핑 수칙", body, "#f7f2e8")


def s24():
    return (img_block("24-closing-banner.jpg", "올가을, 지리산 단풍 아래서 비우고 채우러 가요 - 2026 산사캠프 하동 쌍계사")
            + f'<div style="padding:18px 20px;margin:0;background:{C_RED};">'
              f'<p style="margin:0;font-size:17px;font-weight:bold;color:#ffffff;text-align:center;">구매는 페이지 상단 옵션에서 선택해 주세요.</p></div>')


def s25():
    rows = [
        ("문의", f"산사캠프 운영사무국 {TEL} · {MAIL}"),
        ("주최/주관", "쌍계사, 산사캠프"),
        ("운영", "산사캠프"),
        ("후원", "한국불교문화사업단, NH농협, NH투자증권, (주)도반HC"),
        ("언론", "불교닷컴"),
    ]
    trs = "".join(
        f'<tr><td style="padding:8px 8px 8px 0;vertical-align:top;white-space:nowrap;color:#aaa;font-size:15px;">{a}</td>'
        f'<td style="padding:8px 0;vertical-align:top;color:#ffffff;font-size:15px;">{b}</td></tr>' for a, b in rows)
    body = f'<table style="width:100%;border-collapse:collapse;">{trs}</table>'
    return (f'<div style="padding:28px 20px;margin:0;background:#211d1a;">'
            f'<h3 style="margin:0 0 12px;font-size:20px;font-weight:bold;color:#ffffff;">문의 · 주최 · 후원</h3>{body}</div>')


COMMON = [s1, s2, s3, s4, s6, s7, s19, s20, s21, s22, s23, s8, s24, s25]

PRODUCTS = [
    ("product-1-hanok-2to4.html", "1. 한옥 스테이 (2~4인실)",
     [s15, s16, s9, lambda: s17(HANOK_2TO4), lambda: s18(with_6=False)]),
    ("product-2-hanok-5to6.html", "2. 한옥 가족·단체실 (5~6인실)",
     [s15, s9, lambda: s17(HANOK_5TO6), s18]),
    ("product-3-camping.html", "3. 캠핑존 스테이",
     [s9, s10, s11, s12, s14]),
    ("product-4-petkids.html", "4. Pet & Kids존",
     [s13, s9, s10, s11, s12, s14]),
]

FORBIDDEN = [r"<script", r"<style", r"\bclass=", r"<iframe", r"<form", r"position\s*:\s*fixed", r"<link"]


def build_product(blocks):
    inner = "\n".join(b() for b in blocks + COMMON)
    return f"<div {WRAP}>\n{inner}\n</div>\n"


def visible_text(h):
    t = re.sub(r"<[^>]+>", "", h)
    t = html.unescape(t)
    return t


def main():
    stats = []
    previews = []
    for fname, title, blocks in PRODUCTS:
        out = build_product(blocks)
        for pat in FORBIDDEN:
            assert not re.search(pat, out, re.I), (fname, pat)
        vt = visible_text(out)
        assert "[" not in vt.replace("[필수 확인]", ""), (fname, "대괄호가 남아 있음")
        with open(os.path.join(ROOT, "store-detail", fname), "w", encoding="utf-8") as f:
            f.write(out)
        imgs = re.findall(r'src="' + re.escape(IMG_BASE) + r'([^"]+)"', out)
        stats.append((fname, title, len(out), len(re.sub(r"\s", "", vt)), len(vt.strip()), imgs))
        previews.append((fname, title, out))

    # 미리보기 페이지 (public/, noindex) — 브라우저 확인용이라 스마트스토어 규칙과 무관
    nav = "".join(f'<a href="#p{i+1}">{e(t)}</a>' for i, (_, t, _) in enumerate(previews))
    secs = "".join(
        f'<section id="p{i+1}"><h2>{e(t)} <small>store-detail/{f}</small></h2>{h}</section>'
        for i, (f, t, h) in enumerate(previews))
    page = f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>스마트스토어 상세 미리보기 · 산사캠프</title>
<style>
body{{margin:0;background:#e9e6df;font-family:sans-serif}}
nav{{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;padding:10px;background:#1f3a2c}}
nav a{{color:#fff;text-decoration:none;font-size:14px;padding:6px 12px;border:1px solid #ffffff55;border-radius:999px}}
nav a:hover{{background:#ffffff22}}
section{{max-width:860px;margin:24px auto;background:#fff;box-shadow:0 2px 10px #0002;scroll-margin-top:60px}}
section h2{{margin:0;padding:14px 20px;background:#a63c2c;color:#fff;font-size:18px}}
section h2 small{{font-weight:normal;opacity:.8;font-size:12px;margin-left:6px}}
</style></head><body>
<nav>{nav}</nav>
{secs}
</body></html>
"""
    os.makedirs(os.path.join(ROOT, "public", "store-detail"), exist_ok=True)
    with open(os.path.join(ROOT, "public", "store-detail", "preview.html"), "w", encoding="utf-8") as f:
        f.write(page)

    for fname, title, nhtml, nchar, nchar_sp, imgs in stats:
        print(f"{fname}\tHTML {nhtml:,}자\t본문 {nchar_sp:,}자(공백 제외 {nchar:,}자)\t이미지 {len(imgs)}장")
    return stats


if __name__ == "__main__":
    main()
