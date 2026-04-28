# Security Review: Mock Auth Hardening (2026-04-20)

## Summary
- Critical: 0
- High: 1
- Medium: 1
- Low: 1

## Findings

### [HIGH] 클라이언트 내 목업 자격증명 노출
- **File:** src/features/auth/model/mock-auth-service.ts
- **Category:** OWASP A02 / A07
- **Description:** BE API가 없어 목업 이메일/비밀번호/OTP 코드가 프런트 코드에 존재합니다.
- **Impact:** 번들 분석 시 자격증명 규칙을 알 수 있어 완전한 보안은 불가능합니다.
- **Recommendation:** 운영 전 반드시 서버 인증으로 전환하고, 프런트에는 비밀값/검증 로직을 두지 마세요.

### [MEDIUM] 감사 로그 신뢰성 한계(클라이언트 저장)
- **File:** src/features/audit/model/audit-log-store.ts
- **Category:** OWASP A09
- **Description:** 인증 이벤트가 localStorage에 저장되어 사용자 임의 수정/삭제가 가능합니다.
- **Impact:** 포렌식 신뢰도가 낮습니다.
- **Recommendation:** 서버 측 append-only 감사 로그로 이전 필요.

### [LOW] 401 로그아웃은 프런트 단 처리
- **File:** src/shared/api/client.ts, src/app/providers/auth-session-provider.tsx
- **Category:** OWASP A01
- **Description:** 401 응답 시 클라이언트 상태 정리를 수행하지만, 권한 강제는 서버가 담당해야 합니다.
- **Recommendation:** 서버가 모든 보호 API에서 권한을 검증하고 401/403 정책을 일관 적용하세요.

## Passed Checks
- 로그인 시도 제한/잠금(연속 실패 잠금) 적용
- OTP 코드 검증 실패 처리 및 인증 이벤트 감사 로그 기록 적용
- 세션 만료/복원 로직 적용 및 401 공통 로그아웃 핸들러 연결
- `bun audit`: No vulnerabilities found
- `bun run check`: pass
