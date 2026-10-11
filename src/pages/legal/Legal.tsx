import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'

const OPERATOR = { name: '주식회사 아이룬 (산사캠프 사무국)', email: 'info@airoon.kr', site: 'https://sansacamp.com' }
const UPDATED = '2026년 10월 11일'

function Doc({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white px-6 pb-16 pt-[calc(env(safe-area-inset-top)+12px)]">
      <Link to="/more" aria-label="뒤로" className="-ml-2 inline-block p-2"><Icon name="back" /></Link>
      <img src="/wordmark.png" alt="산사캠프" className="mt-4 h-10 w-auto" draggable={false} />
      <h1 className="mt-6 text-[26px] font-extrabold">{title}</h1>
      <p className="mt-1 text-[12px] text-sub">시행일 {UPDATED} · 운영자 {OPERATOR.name}</p>
      <div className="prose-sm mt-8 space-y-7 text-[14px] leading-relaxed text-ink/85 [&_h2]:mb-2 [&_h2]:text-[16px] [&_h2]:font-extrabold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-10 text-[12px] text-sub">문의: {OPERATOR.email}</p>
    </div>
  )
}

export function Privacy() {
  return (
    <Doc title="개인정보처리방침">
      <section>
        <h2>1. 수집하는 개인정보</h2>
        <ul>
          <li>회원가입·로그인: 휴대폰 번호 또는 소셜 계정 식별자(카카오·구글·네이버), 닉네임, 소셜 계정이 제공하는 이메일·프로필 이미지(선택)</li>
          <li>예약: 프로그램·샤워실 예약 내역, 주차 등록 시 차량번호와 이용 일자</li>
          <li>포토: 참가자가 직접 올린 사진과 촬영 장소 태그</li>
          <li>알림: 카카오 알림톡 수신 동의 여부</li>
        </ul>
      </section>
      <section>
        <h2>2. 이용 목적</h2>
        <ul>
          <li>산사캠프(2026.11.6–11.8, 하동 쌍계사) 프로그램·시설 예약과 입장 확인(QR)</li>
          <li>예약 리마인드·행사 안내 알림 발송</li>
          <li>참가자 포토 피드 운영과 부적절 게시물 관리</li>
          <li>럭키드로우 응모·추첨</li>
        </ul>
      </section>
      <section>
        <h2>3. 보유 기간</h2>
        <p>행사 종료일(2026.11.8)로부터 30일 이내에 파기합니다. 다만 참가자가 올린 사진은 본인이 삭제하기 전까지 보관할 수 있으며, 관련 법령이 보존을 요구하는 정보는 그 기간 동안 보관합니다.</p>
      </section>
      <section>
        <h2>4. 제3자 제공과 처리 위탁</h2>
        <ul>
          <li>제3자 제공: 하지 않습니다.</li>
          <li>처리 위탁: 인증·데이터 보관(Supabase Inc.), 웹 호스팅(Vercel Inc.), 알림톡 발송(카카오, 연동 시)</li>
          <li>소셜 로그인 시 카카오·구글·네이버로부터 위 1항의 정보를 제공받습니다.</li>
        </ul>
      </section>
      <section>
        <h2>5. 이용자의 권리</h2>
        <p>앱의 더보기 → 계정 연결에서 로그인 수단을 관리할 수 있고, 올린 사진은 본인이 삭제할 수 있습니다. 열람·정정·삭제·처리정지 요청은 {OPERATOR.email}로 보내 주시면 지체 없이 처리합니다.</p>
      </section>
      <section>
        <h2>6. 안전성 확보 조치</h2>
        <p>전송 구간 암호화(HTTPS), 데이터베이스 행 단위 접근 제어, 관리자 권한 분리를 적용합니다.</p>
      </section>
      <section>
        <h2>7. 개인정보 보호책임자</h2>
        <p>{OPERATOR.name} · {OPERATOR.email}</p>
      </section>
    </Doc>
  )
}

export function Terms() {
  return (
    <Doc title="서비스 이용약관">
      <section>
        <h2>1. 목적</h2>
        <p>이 약관은 {OPERATOR.name}이 운영하는 산사캠프 공식 웹앱(이하 "서비스")의 이용 조건을 정합니다.</p>
      </section>
      <section>
        <h2>2. 서비스 내용</h2>
        <ul>
          <li>행사 프로그램·샤워실·주차장 사전예약과 QR 입장 확인</li>
          <li>참가자 포토 피드, 실시간 알림, 럭키드로우 응모</li>
          <li>입장권 판매는 서비스 밖(NOL티켓)에서 진행되며, 본 서비스에서 결제는 이루어지지 않습니다.</li>
        </ul>
      </section>
      <section>
        <h2>3. 계정</h2>
        <ul>
          <li>휴대폰 번호 인증 또는 카카오·구글·네이버 계정으로 가입합니다. 하나의 계정에 여러 로그인 수단을 연결할 수 있습니다.</li>
          <li>타인의 번호나 계정으로 가입할 수 없으며, 계정 관리 책임은 이용자에게 있습니다.</li>
        </ul>
      </section>
      <section>
        <h2>4. 예약 규칙</h2>
        <ul>
          <li>모든 프로그램은 사전예약제이며 정원이 차면 예약할 수 없습니다.</li>
          <li>프로그램은 1인당 하루 3개까지, 같은 프로그램은 1회만 예약할 수 있으며 시간이 겹치는 회차는 예약할 수 없습니다.</li>
          <li>샤워실은 1인당 하루 2회까지 예약할 수 있고, 노쇼 2회 시 당일 예약이 제한됩니다.</li>
          <li>쌍계사 경내 차량 진입은 불가하며 지정 주차장을 이용해야 합니다.</li>
        </ul>
      </section>
      <section>
        <h2>5. 게시물</h2>
        <p>참가자가 올린 사진의 저작권은 올린 사람에게 있습니다. 운영자는 타인의 권리를 침해하거나 행사 취지에 맞지 않는 게시물을 사전 통지 없이 숨길 수 있습니다. 올린 사진은 행사 홍보 목적으로 서비스 내에서 노출될 수 있습니다.</p>
      </section>
      <section>
        <h2>6. 행사 수칙</h2>
        <p>화기 사용과 취사는 전면 금지되며, QR 팔찌는 행사 기간 내내 착용해야 합니다. 매일 21시 이후는 고요의 시간으로, 소음을 자제해야 합니다.</p>
      </section>
      <section>
        <h2>7. 책임의 한계</h2>
        <p>천재지변, 통신 장애 등 운영자가 통제할 수 없는 사유로 서비스가 중단될 수 있습니다. 운영자는 이용자가 서비스에서 얻은 정보로 인한 손해에 대해 고의 또는 중과실이 없는 한 책임지지 않습니다.</p>
      </section>
      <section>
        <h2>8. 준거법</h2>
        <p>이 약관은 대한민국 법을 따르며, 분쟁은 운영자 소재지 관할 법원에서 다룹니다.</p>
      </section>
    </Doc>
  )
}
