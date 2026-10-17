#!/usr/bin/env python3
"""산사캠프 스마트스토어 상세 HTML 생성기.

실행: python3 store-detail/build.py  (레포 루트에서)
결과: store-detail/product-*.html 3개, public/store-detail/preview.html, store-detail/README.md 의 통계 표

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

# ── 공통 스타일 (원본 상세 디자인 톤: 크림 종이 · 노란 알약 제목 · 굵은 테두리 카드) ──
C_GREEN = "#1f3b2f"
C_RED = "#a63c2c"
C_ORANGE = "#d3602a"
C_GOLD = "#c4993b"
C_YELLOW = "#eecf7c"
INK = "#211d1a"
PAPER = "#fbf7ee"   # 카드 안쪽
CREAM = "#efe9dd"   # 공통 섹션 바탕
BEIGE = "#e2d3b4"   # 가격·상품 섹션 바탕
FONT = "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif"

WRAP = f'style="max-width:860px;margin:0 auto;font-family:{FONT};line-height:1.7;color:{INK};word-break:keep-all;"'
P = 'style="margin:0 0 10px;font-size:16px;"'
P_LAST = 'style="margin:0;font-size:16px;"'
NOTE = 'style="margin:0;font-size:14px;color:#6b6358;"'
LINK = f'style="color:{C_RED};font-weight:bold;text-decoration:none;"'
HL = 'style="background:linear-gradient(transparent 55%,#f3d27a 55%);"'   # 원본의 노란 형광펜 강조
HL_ON_RED = f'style="color:{C_YELLOW};"'

# 스마트스토어는 외부 링크(<a href>)를 지우거나 판매 제재할 수 있어 전화·메일은 링크 없이 강조 글자로만
TEL = f'<b {LINK}>02-2269-5002</b>'
MAIL = f'<b {LINK}>info@airoon.kr</b>'


def e(s):
    return html.escape(s, quote=False)


def img(file, alt, extra=""):
    return f'<img src="{IMG_BASE}{file}" alt="{html.escape(alt)}" style="width:100%;display:block;{extra}">'


def img_block(file, alt):
    return f'<div style="margin:0;padding:0;">{img(file, alt)}</div>'


def pill(title):
    # 원본의 노란 알약 모양 섹션 제목
    return (f'<div style="text-align:center;margin:0 0 22px;">'
            f'<span style="display:inline-block;background:{C_YELLOW};border:3px solid {INK};border-radius:40px;'
            f'padding:8px 26px;font-size:20px;font-weight:900;line-height:1.4;color:{INK};box-shadow:4px 4px 0 {INK};">'
            f'{title}</span></div>')


def section(title, body, bg=CREAM):
    head = pill(title) if title else ""
    pad = "36px 16px" if body else "36px 16px 0"
    return f'<div style="padding:{pad};margin:0;background:{bg};">{head}{body}</div>'


def card(body, header=None, header_bg=C_GREEN, header_right="", pad="18px 16px"):
    top = ""
    if header:
        right = (f'<span style="float:right;font-size:13px;font-weight:bold;border:2px solid #ffffff;border-radius:20px;'
                 f'padding:1px 10px;margin-top:2px;">{header_right}</span> ') if header_right else ""
        top = (f'<div style="background:{header_bg};color:#ffffff;padding:12px 16px;border-bottom:3px solid {INK};'
               f'font-size:19px;font-weight:900;">{right}{header}</div>')
    return (f'<div style="background:{PAPER};border:3px solid {INK};border-radius:10px;box-shadow:5px 5px 0 {INK};'
            f'overflow:hidden;margin:0 0 6px;">{top}<div style="padding:{pad};">{body}</div></div>')


def alert_box(title, items):
    # 원본의 빨간 '필수 확인' 박스
    body = "".join(f'<p style="margin:0 0 8px;font-size:16px;color:#ffffff;">{x.replace("<b>", f"<b {HL_ON_RED}>")}</p>'
                   for x in items)
    return (f'<div style="background:{C_RED};border:3px solid {INK};border-radius:10px;box-shadow:5px 5px 0 {INK};'
            f'padding:18px 16px 10px;margin:0 0 6px;">'
            f'<p style="margin:0 0 12px;font-size:18px;font-weight:900;color:#ffffff;line-height:1.5;">'
            f'<span style="display:inline-block;background:{C_YELLOW};color:{INK};border:2px solid {INK};border-radius:6px;'
            f'padding:0 8px;margin-right:4px;font-size:15px;">필수 확인</span> {title}</p>{body}</div>')


def lines(items, style=P):
    out = []
    for i, x in enumerate(items):
        st = P_LAST if (style == P and i == len(items) - 1) else style
        out.append(f"<p {st}>{x.replace('<b>', f'<b {HL}>')}</p>")
    return "".join(out)


def price_table(rows):
    trs = "".join(
        f'<tr><td style="padding:12px 4px;border-bottom:1px dashed #c9bfa8;text-align:left;vertical-align:top;font-size:16px;">{e(a)}</td>'
        f'<td style="padding:12px 4px;border-bottom:1px dashed #c9bfa8;text-align:right;vertical-align:top;'
        f'font-size:18px;font-weight:900;white-space:nowrap;">{e(b)}</td></tr>' for a, b in rows)
    return f'<table style="width:100%;border-collapse:collapse;margin:0;">{trs}</table>'


def caption(text):
    return (f'<p style="margin:0 0 12px;padding:10px 12px;background:#e8f0ea;border-radius:6px;font-size:15px;'
            f'font-weight:bold;color:{C_GREEN};">{text}</p>')


# ══ 섹션별 블록 (구성표 No) ═════════════════════════════════

def s1():
    return img_block("01-poster.jpg",
                     "2026 산사캠프 with 쌍계사 메인 포스터 - 산사에서 즐기는 마인드 디톡스, 하동 쌍계사 일원 캠핑·한옥 템플스테이 2026년 11월 6일~8일")


def s2():
    chip = 'style="display:inline-block;margin:0 6px 8px 0;padding:4px 12px;border:1px solid #8c847a;border-radius:20px;font-size:14px;color:#efe9dd;"'
    tags = " ".join(f'<span {chip}>{t}</span>' for t in ["#차(茶) 시배지", "#화개동천", "#국보 진감선사대성탑비"])
    body = (
        f'<p style="margin:0 0 10px;"><span style="display:inline-block;background:{C_YELLOW};color:{INK};border:2px solid {INK};'
        f'border-radius:4px;padding:0 10px;font-size:14px;font-weight:900;letter-spacing:1px;">LOCATION</span></p>'
        f'<p style="margin:0 0 2px;font-size:16px;font-weight:bold;color:{C_YELLOW};">지리산 · 천년 고찰</p>'
        f'<p style="margin:0 0 10px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.3;">하동 쌍계사 일원</p>'
        f'<p style="margin:0 0 4px;font-size:16px;color:#e8e2d4;">경남 하동군 화개면 쌍계사길 59</p>'
        f'<p style="margin:0 0 14px;font-size:16px;font-weight:bold;color:#ffffff;">2026년 11월 6일(금)~8일(일), 2박 3일</p>'
        f'<div>{tags}</div>'
    )
    return (img_block("02-location-photos-2.jpg",
                      "지리산 하동 쌍계사 가을 단풍 사진 - 천년 고찰 쌍계사 구층석탑, 화개동천 계곡, 돌담길 산책")
            + f'<div style="padding:22px 20px 26px;margin:0;background:#1f1b18;">{body}</div>')


def s3():
    return img_block("03-date-banner.jpg",
                     "산사캠프 일정 11월 6일(금)~8일(일) 하동 쌍계사 일원 - NO FOMO, JUST FOREST 낮에는 채우고 밤에는 비웁니다")


def s4():
    date_pill = (f'style="display:inline-block;margin:0 0 8px;padding:6px 16px;background:{C_YELLOW};border:2px solid {INK};'
                 f'border-radius:30px;font-size:15px;font-weight:bold;"')
    time_txt = (SHOW_TIME_SAT if SHOW_TIME_FRI == SHOW_TIME_SAT
                else f"11.6 (금) {SHOW_TIME_FRI} / 11.7 (토) {SHOW_TIME_SAT}")
    inner = (
        f'<p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#6b6358;">FOREST LIVE · 산사의 가을 저녁 공연</p>'
        f'<p style="margin:0 0 14px;font-size:30px;font-weight:900;color:{INK};line-height:1.2;">아티스트: {ARTIST}</p>'
        f'<p style="margin:0 0 16px;font-size:16px;">공연 시간: <b style="font-size:24px;color:{C_RED};">{time_txt}</b></p>'
        f'<div><span {date_pill}>11.6 (금) 산사토크 &amp; 어쿠스틱 나이트</span> </div>'
        f'<div><span {date_pill}>11.7 (토) 숲속 힐링 콘서트 &amp; 스페셜 토크</span></div>'
        f'<p style="margin:10px 0 0;padding-top:12px;border-top:2px solid {INK};font-size:16px;font-weight:bold;">21:00 이후는 고요의 시간입니다.</p>'
    )
    box = (f'<div style="background:{PAPER};border:3px solid {INK};border-radius:10px;box-shadow:5px 5px 0 {INK};padding:10px;">'
           f'<div style="border:2px dashed #b9ae99;border-radius:6px;padding:22px 14px;text-align:center;">{inner}</div></div>')
    return section("공연 · 아티스트", box, C_RED)


def s6():
    return section("티켓 판매 안내", card(lines([
        "– 본 행사는 <b>100% 사전예약제</b>로 운영되며, 현장 판매는 없습니다.",
        "– 판매 규모: <b>캠핑 250동 · 한옥 23실 (최대 700명 한정)</b>",
        "– 공식판매처: (주)아이룬 여행사",
        "– 캠핑존은 1사이트당 최대 4인까지 수용 가능하며, <b>3~4번째 추가 인원은 '추가상품'에서 꼭 선택해 주세요.</b>",
        "– 36개월 미만 무료 (증빙 필수)",
        "– 한정 수량으로 운영되어 판매가 조기 종료될 수 있습니다.",
        "– '차 한잔에 쉼을 담고'는 100명 한정 사전예약 프로그램입니다.",
    ])))


def s7():
    # 07-entry-steps.jpg 안에 '입장 방법 안내' 제목이 있어 텍스트 제목은 따로 넣지 않음
    body = card(
        f'<p style="margin:0 0 14px;font-size:16px;font-weight:900;">STEP 1 사전예약 → STEP 2 예약 내역 확인 → STEP 3 입장 팔찌 수령</p>'
        + lines([
            "– 현장에서 예약자 성함·연락처로 예약 내역을 확인한 후 입장 팔찌를 수령합니다.",
            "– 입장 팔찌를 착용해야만 제반 시설 및 식음 이용이 가능합니다.",
            "– 입장 시간: <b>11월 6일(금) 14:00부터</b> (20:00 이전 입장 마감)",
            "– 체크인 &amp; 웰컴키트 수령: 11월 6일(금) 14:00 ~ 16:00",
            "– 체크아웃: <b>11월 8일(일) 11:00</b>",
            "– 차량: 쌍계사 경내 진입 불가. 전용 주차장에 주차 후 도보 또는 카트로 이동",
            "– 주차: <b>무료 · 사전등록제(1팀 1대) · 미등록 차량 진입 불가</b>",
            f"– 문의: 산사캠프 운영사무국 {TEL} · {MAIL}",
        ]))
    return (f'<div style="padding:20px 0 0;margin:0;background:#ece6da;">'
            + img("07-entry-steps.jpg", "산사캠프 입장 방법 STEP 1 사전예약, STEP 2 예약 내역 확인, STEP 3 입장 팔찌 수령")
            + '</div>' + section("", body, "#ece6da"))


def s8():
    body = card(lines([
        "☆ <b>취소 및 환불은 2026년 11월 1일(일) 24시까지 가능합니다.</b>",
        "☆ 티켓 양도는 직계 가족만 가능하며, 예매자 신분증, 양도자 신분증, 가족관계증명서를 지참하시어 방문하셔야 합니다.",
    ]))
    return section("취소 · 환불 · 양도 안내", body)


def s9():
    return img_block("09-price-receipt.jpg",
                     "산사캠프 판매 티켓 및 가격 안내 - 티켓 한 장으로 끝내는 올인클루시브 웰니스, 산사캠프 영수증 사찰공양 9대 힐링 프로그램 산사 라이브 웰컴 기프트 키트 힐링 마켓 현장 추가 결제 0원")


ALL_INCL = "모든 요금은 2박 기준 · 사찰공양 5식 · 전 프로그램 포함 (VAT 포함)"


def s10():
    body = (
        f'<p style="margin:0 0 14px;text-align:center;font-size:15px;font-weight:bold;">{ALL_INCL}</p>'
        + card(
            caption("캠핑존 1사이트는 2인 기준이며, 최대 4인 이용 가능")
            + f'<p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:{C_RED};">1사이트 2인 기준 요금, 1인 이용 시에도 사이트 요금 동일</p>'
            + price_table([
                ("캠핑존 1사이트 (2인 입장권 기준)", "380,000원"),
                ("인원 추가요금 (성인, 3·4번째)", "150,000원"),
                ("인원 추가요금 (36개월 이상~미취학아동, 3·4번째)", "100,000원"),
            ]),
            header="캠핑존", header_right="Camping Zone")
    )
    return section("캠핑존 가격 안내", body, BEIGE)


def s11():
    return section("", alert_box("인원 추가 시 꼭 확인하세요!", [
        "1개 사이트당 성인 2인 기준 · 최대 4인 이용 가능",
        "<b>3~4번째 추가 인원은 '추가상품'에서 꼭 선택해 주세요.</b>",
        "※ 36개월 미만 무료 (증빙 필수)",
        "최대 인원(4인)을 넘을 경우 추가 사이트로 예약 부탁드립니다.",
    ]), BEIGE).replace("padding:36px 16px;", "padding:4px 16px 20px;", 1)


def s12():
    body = card(
        img("12-site-size.jpg", "산사캠프 캠핑존 사이트 크기 도식 가로 3m × 세로 4m", "margin:0 0 10px;")
        + lines([
            "· 사이트 크기: <b>가로 3m × 세로 4m</b> (최대 4인)",
            "· 텐트에서는 <b>전기 사용이 불가</b>하니 휴대폰 보조배터리를 준비해 주세요.",
            "· 문화재보호구역이므로 샤워장에서는 <b>비치된 친환경 비누</b>만 사용 가능합니다.",
            "· 주차 무료 · 사전등록제(1팀 1대) · 미등록 차량 진입 불가",
            "· 사전 지정 구역 내 피칭",
            "· <b>사이트는 예약 순서대로 임의 배정됩니다.</b>",
        ]), header="캠핑 사이트 안내")
    return section("", body, BEIGE).replace("padding:36px 16px;", "padding:4px 16px 24px;", 1)


def s13():
    body = card(
        f'<p style="margin:0 0 10px;font-size:18px;font-weight:900;">Pet &amp; Kids Zone (쌍계초 · 85동)</p>'
        + lines([
            "반려견, 아이와 함께하는 전용 구역입니다.",
            "· 요금은 캠핑존과 동일합니다.",
            "· 펫티켓: <b>리드줄 필수</b>, 반려동물 대소변은 깔끔하게 수거해 주세요.",
        ]), header="Pet &amp; Kids Zone", header_bg=C_ORANGE)
    return section("Pet &amp; Kids Zone 안내", body, BEIGE)


def s14():
    body = card(
        price_table([("감성 텐트 렌탈 풀세트 (4인용)", "130,000원 / 동")])
        + f'<p style="margin:10px 0 0;font-size:15px;color:#6b6358;">텐트, 매트, 감성 캠핑 테이블 및 체어 일체</p>',
        header="ADD-ON 추가 옵션", header_bg=C_GOLD)
    return section("", body, BEIGE).replace("padding:36px 16px;", "padding:4px 16px 36px;", 1)


def s15():
    head = section("한옥 방사 스테이",
                   f'<p style="margin:0;text-align:center;font-size:16px;color:#4a443c;">전통 한옥의 고즈넉한 온돌방에서 머무는 템플스테이형 객실</p>',
                   BEIGE).replace("padding:36px 16px;", "padding:36px 16px 20px;", 1)
    return head + img_block("15-hanok-photos-2.jpg",
                            "하동 쌍계사 한옥 방사 스테이 사진 - 지리산 능선이 보이는 한옥 마당, 차나무가 반기는 한옥 대문, 숲과 계곡을 품은 방사 템플스테이 객실")


def s16():
    return img_block("16-twin-room-card.jpg",
                     "산사캠프 한옥 2인실 구성 - 전통 한옥 온돌방 2박, 사찰공양 5식, 9대 프로그램 전체 참여, 웰컴 기프트 키트")


def s17(rows):
    body = (f'<p style="margin:0 0 14px;text-align:center;font-size:15px;font-weight:bold;">{ALL_INCL}</p>'
            + card(price_table(rows), header="한옥 방사 스테이", header_bg=C_RED, header_right="Hanok Stay"))
    return section("한옥 방사 스테이 가격 안내", body, BEIGE)


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


def s17_balance():
    # 한옥을 1개 상품으로 합쳐서, 5·6인실은 스토어에서 '객실 1차 + 잔금' 두 옵션으로 결제됨 (구매흐름 점검 결과 금액)
    return section("", alert_box("5인실·6인실은 잔금 옵션을 꼭 함께 선택해 주세요!", [
        "· 5인실 = 객실 1,000,000원 + 5인실 잔금 100,000원 (합계 1,100,000원)",
        "· 6인실 = 객실 1,000,000원 + 6인실 잔금 300,000원 (합계 1,300,000원)",
        "<b>잔금 옵션이 빠진 예약은 운영팀이 확인 후 개별 연락드립니다.</b>",
    ]), BEIGE).replace("padding:36px 16px;", "padding:4px 16px 20px;", 1)


def s18(with_6=True):
    # 6인실 안내는 6인실을 파는 상품에만
    title = (f'<p style="margin:0 0 12px;font-size:19px;font-weight:900;">'
             f'<span style="display:inline-block;width:26px;height:26px;line-height:26px;border-radius:13px;background:{C_RED};'
             f'color:#ffffff;text-align:center;font-size:16px;margin-right:4px;">!</span> 요금 유의사항</p>')
    body = card(title + lines(([
        "– 한옥 스테이 6인실은 <b>최대 8인까지 이용 가능</b>하므로, 추가 인원은 별도 구매 부탁드립니다.",
    ] if with_6 else []) + [
        "– 운영팀에서 <b>예약 확인 후 잘못 예약된 경우 개별 연락</b>드릴 예정입니다.",
    ]))
    return section("", body, BEIGE).replace("padding:36px 16px;", "padding:4px 16px 36px;", 1)


def s19():
    body = card(
        f'<p style="margin:0 0 6px;font-size:15px;color:#6b6358;">하동군 화개면 쌍계사길 59</p>'
        + price_table([
            ("A 쌍계사 경내 (대웅전 주변)", "30동"),
            ("B 쌍계초 · Pet & Kids Zone", "85동"),
            ("C 주차장 · 언덕", "135동"),
        ])
        + f'<p style="margin:14px 0 4px;font-size:15px;font-weight:bold;">메인 무대 → 일주문 864m · 12분</p>'
        + f'<p style="margin:0;font-size:15px;font-weight:bold;">쌍계초 → 일주문 501m · 7분</p>')
    return (img_block("19-site-map.jpg",
                      "산사캠프 행사장 안내도 - 지리산 쌍계사 일원 캠핑존, Pet & Kids Zone, 한옥 방사, 메인 무대, 주차장 지도")
            + section("", body).replace("padding:36px 16px;", "padding:16px 16px 36px;", 1))


PROGRAMS = [
    ("01", "아침을 여는 요가 &amp; 선명상", "매일 07:00", "지리산의 아침 공기와 함께하는 스트레칭과 숲속 선명상",
     "20-program-01-yoga.jpg", "산사캠프 프로그램 01 아침 요가와 선명상 - 쌍계사 경내 숲속 명상"),
    ("02", "싱잉볼 사운드 배스", "", "화개동천 계곡물 소리와 싱잉볼의 맑은 진동으로 하는 사운드 힐링",
     "20-program-02-singing-bowl.jpg", "산사캠프 프로그램 02 싱잉볼 사운드 배스 명상 체험"),
    ("03", "스님과의 즉문즉답 차담", "", "스님과 차 한 잔을 나누며 고민을 내려놓는 시간",
     "20-program-03-monk-qa.jpg", "산사캠프 프로그램 03 스님과의 즉문즉답 차담 - 스님 상담과 마음 처방전"),
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
    head = (pill("프로그램 안내")
            + f'<p style="margin:0 0 14px;text-align:center;font-size:26px;font-weight:900;line-height:1.3;">9대 마인드 디톡스 프로그램</p>'
            + f'<div style="text-align:center;"><span style="display:inline-block;background:{C_RED};color:#ffffff;border-radius:30px;'
              f'padding:8px 20px;font-size:16px;font-weight:bold;">현장 추가 결제 <span style="color:{C_YELLOW};">0원</span></span></div>')
    out = section("", head, PAPER).replace("padding:36px 16px;", "padding:36px 16px 24px;", 1)
    for no, name, tag, desc, f, alt in PROGRAMS:
        if f:
            out += img_block(f, alt)
        tag_html = (f' <span style="display:inline-block;background:{C_GOLD};color:#ffffff;border-radius:4px;padding:0 8px;'
                    f'font-size:13px;vertical-align:2px;">{tag}</span>') if tag else ""
        out += (f'<div style="padding:12px 24px 26px;margin:0;background:{PAPER};">'
                f'<p style="margin:0 0 4px;font-size:19px;font-weight:900;line-height:1.4;">'
                f'<span style="color:{C_RED};">{no}</span> {name}{tag_html}</p>'
                f'<p style="margin:0;font-size:15px;color:#4a443c;">{desc}</p></div>')
    return out


def s21():
    period = (f'<div style="background:{C_GREEN};color:#ffffff;border:3px solid {INK};border-radius:10px;box-shadow:5px 5px 0 {INK};'
              f'padding:16px;margin:0 0 14px;">'
              f'<p style="margin:0 0 2px;font-size:14px;color:{C_YELLOW};">사전예약 기간</p>'
              f'<p style="margin:0 0 12px;font-size:20px;font-weight:900;">10월 28일(수) ~ 11월 1일(일)</p>'
              f'<p style="margin:0 0 2px;font-size:14px;color:{C_YELLOW};">예약 방법</p>'
              f'<p style="margin:0;font-size:17px;font-weight:900;">산사캠프 APP에서 프로그램별 사전예약 (QR 스캔)</p></div>')
    notes = card(
        f'<p style="margin:0 0 12px;font-size:18px;font-weight:900;">예약 시 유의사항</p>'
        + lines([
            "1. 프로그램별 참여 인원이 제한되어 <b>조기 마감</b>될 수 있습니다.",
            "2. 1인당 예약 가능한 프로그램 수에 제한이 있을 수 있습니다.",
            "3. 프로그램별 운영 시간과 장소를 확인한 후 예약해 주세요.",
            "4. 예약한 프로그램 시간에 맞춰 현장에 도착해 주세요.",
            "5. 예약 취소·변경은 APP 안내를 확인해 주세요.",
        ]))
    return section("프로그램 사전예약 안내",
                   period + img("21-program-qr.jpg", "산사캠프 프로그램 사전예약 QR 코드 sansacamp.com", "margin:0 0 14px;") + notes)


def s22():
    return (img_block("22-timetable.jpg",
                      "산사캠프 2박 3일 타임테이블 - 11월 6일 체크인, 사찰공양 5식, 요가, 싱잉볼, 트래킹, 다도 명상, 산사토크 공연 19:00–20:30, 11월 8일 11:00 체크아웃")
            + '<div style="padding:4px 20px 28px;margin:0;background:#162b22;">'
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
    items = "".join(
        f'<div style="padding:16px 2px;border-top:2px solid {INK};">'
        f'<p style="margin:0 0 4px;font-size:18px;font-weight:900;"><span style="color:{C_RED};">{no}</span> {e(t)}</p>'
        f'<p style="margin:0;font-size:15px;color:#4a443c;">{e(d)}</p></div>'
        for no, t, d in RULES)
    body = (f'<p style="margin:-8px 0 18px;text-align:center;font-size:15px;color:#6b6358;">모두의 숲을 지키기 위해 꼭 읽어 주세요.</p>'
            + items + f'<div style="border-top:2px solid {INK};"></div>')
    return section("유의사항 &amp; 클린캠핑 수칙", body)


def s24():
    return (img_block("24-closing-banner.jpg", "올가을, 지리산 단풍 아래서 비우고 채우러 가요 - 2026 산사캠프 하동 쌍계사")
            + f'<div style="padding:4px 16px 30px;margin:0;background:{C_RED};">'
              f'<p style="margin:0;padding:14px 12px;background:{C_YELLOW};border:3px solid {INK};border-radius:8px;'
              f'font-size:17px;font-weight:900;color:{INK};text-align:center;">구매는 페이지 상단 옵션에서 선택해 주세요.</p></div>')


def s25():
    rows = [
        ("주최/주관", "쌍계사, 산사캠프"),
        ("운영", "산사캠프"),
        ("후원", "한국불교문화사업단, NH농협, NH투자증권, (주)도반HC"),
        ("언론", "불교닷컴"),
    ]
    trs = "".join(
        f'<tr><td style="padding:7px 12px 7px 0;vertical-align:top;white-space:nowrap;color:#9a9288;font-size:15px;">{a}</td>'
        f'<td style="padding:7px 0;vertical-align:top;color:#ffffff;font-size:15px;">{b}</td></tr>' for a, b in rows)
    link = f'style="color:{C_YELLOW};font-weight:bold;text-decoration:none;font-size:17px;"'
    contact = (f'<p style="margin:0 0 2px;font-size:14px;color:#9a9288;">문의</p>'
               f'<p style="margin:0 0 6px;font-size:20px;font-weight:900;color:#ffffff;">산사캠프 운영사무국</p>'
               f'<p style="margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid #4a443c;">'
               f'<b {link}>02-2269-5002</b> · <b {link}>info@airoon.kr</b></p>')
    return (f'<div style="padding:32px 20px;margin:0;background:{INK};">'
            f'{contact}<table style="width:100%;border-collapse:collapse;">{trs}</table></div>')



# 메인 포스터(1)는 모든 상품 맨 위, 그다음 상품별 블록, 그다음 공통 블록
TOP = [s1]
COMMON = [s2, s3, s4, s6, s7, s19, s20, s21, s22, s23, s8, s24, s25]

PRODUCTS = [
    ("product-1-hanok.html", "1. 한옥 방사 스테이 (2~6인실)",
     [s15, s16, s9, lambda: s17(HANOK_2TO4 + HANOK_5TO6), s17_balance, s18]),
    ("product-2-camping.html", "2. 캠핑존 스테이",
     [s9, s10, s11, s12, s14]),
    ("product-3-petkids.html", "3. Pet & Kids존",
     [s13, s9, s10, s11, s12, s14]),
]

FORBIDDEN = [r"<script", r"<style", r"\bclass=", r"<iframe", r"<form", r"position\s*:\s*fixed", r"<link", r"<a[\s>]", r"href="]


def build_product(blocks):
    inner = "\n".join(b() for b in TOP + blocks + COMMON)
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

    # 복사 페이지 (public/, noindex) — 휴대폰에서 버튼 한 번으로 상품별 HTML 복사
    blocks = "".join(
        f'<section><h2>{e(t)}</h2><p class="meta">{len(h):,}자 · store-detail/{f}</p>'
        f'<button onclick="cp({i})">HTML 복사하기</button><span class="ok" id="ok{i}"></span>'
        f'<textarea id="t{i}" readonly>{html.escape(h)}</textarea></section>'
        for i, (f, t, h) in enumerate(previews))
    copy_page = f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>스마트스토어 상세 HTML 복사 · 산사캠프</title>
<style>
body{{margin:0;padding:16px;background:#efe9dd;font-family:sans-serif;color:#211d1a}}
h1{{font-size:20px;margin:0 0 6px}} .lead{{font-size:14px;margin:0 0 18px;color:#4a443c;line-height:1.6}}
section{{background:#fbf7ee;border:3px solid #211d1a;border-radius:10px;padding:16px;margin:0 0 16px}}
h2{{font-size:18px;margin:0 0 4px}} .meta{{font-size:12px;color:#6b6358;margin:0 0 12px}}
button{{font-size:17px;font-weight:bold;padding:12px 18px;background:#eecf7c;border:3px solid #211d1a;border-radius:30px;color:#211d1a}}
.ok{{margin-left:10px;font-weight:bold;color:#1f3b2f}}
textarea{{display:block;width:100%;box-sizing:border-box;height:90px;margin-top:12px;font-size:11px}}
</style></head><body>
<h1>스마트스토어 상세 HTML 복사</h1>
<p class="lead">① 상품 버튼 「HTML 복사하기」 → ② 스마트스토어 상품 수정 › 상세설명 › <b>HTML 작성</b> 칸의 기존 내용을 모두 지우고 붙여넣기 → ③ 모바일 미리보기 확인 → ④ 저장</p>
{blocks}
<script>
function cp(i){{var t=document.getElementById('t'+i),ok=document.getElementById('ok'+i);
function done(){{ok.textContent='복사됨 ✓';setTimeout(function(){{ok.textContent=''}},3000)}}
if(navigator.clipboard&&navigator.clipboard.writeText){{navigator.clipboard.writeText(t.value).then(done,function(){{t.select();document.execCommand('copy');done()}})}}
else{{t.select();document.execCommand('copy');done()}}}}
</script>
</body></html>
"""
    with open(os.path.join(ROOT, "public", "store-detail", "copy.html"), "w", encoding="utf-8") as f:
        f.write(copy_page)

    for fname, title, nhtml, nchar, nchar_sp, imgs in stats:
        print(f"{fname}\tHTML {nhtml:,}자\t본문 {nchar_sp:,}자(공백 제외 {nchar:,}자)\t이미지 {len(imgs)}장")
    return stats


if __name__ == "__main__":
    main()
