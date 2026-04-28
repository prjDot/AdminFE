# FE API 명세서 초안

이 문서는 현재 프론트엔드 화면과 상태 흐름을 기준으로 정리한 **API 요구사항 초안**이다.

## 기준

- 이 문서는 현재 FE 코드의 화면 구성과 버튼/행동을 바탕으로 작성했다.
- 실제 백엔드 구현은 확인되지 않았다.
- 따라서 아래 명세는 **권장 형태**이며, 일부 항목은 화면 동작상 필요한 API를 추정해 포함했다.
- 추정이 필요한 항목은 별도로 표시했다.

## 확인된 사실

- 앱은 관리자 콘솔이다.
- 인증은 로그인, 선택적으로 MFA(OTP), 세션 복원, 401 처리 기반 로그아웃이 필요하다.
- 주요 화면은 대시보드, 사용자, 실종 공고, 커뮤니티, 신고, 알림 발송, 서비스 상태, 감사 로그, 설정이다.
- 현재 FE에는 `apiClient`가 있고 기본 baseURL은 `VITE_API_URL` 또는 `/api`다.

## 추정만 가능한 부분

- 실제 리소스명, 필드명, 에러 코드, 권한 체계는 백엔드 미구현 상태이므로 확정할 수 없다.
- 아래 필드명은 FE 화면에 맞춘 권장 스키마다.

---

## 1. 공통 규격

### 1-1. 공통 헤더

| Header | 필수 | 설명 |
|---|---:|---|
| `Content-Type: application/json` | 예 | 기본 JSON 요청 |
| `Authorization: Bearer <token>` | 권장 | 세션 토큰 방식일 경우 |

### 1-2. 공통 응답 포맷

권장 응답 포맷은 아래와 같다.

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

오류 응답은 아래 형태를 권장한다.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "아이디 또는 비밀번호가 올바르지 않습니다.",
    "details": {}
  }
}
```

### 1-3. 공통 페이지네이션

리스트 API는 아래 쿼리 규격을 권장한다.

- `page`: 1부터 시작
- `pageSize`: 기본 20
- `query`: 검색어
- `sortBy`: 정렬 필드
- `sortOrder`: `asc` | `desc`

응답 포맷:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

### 1-4. 공통 에러 코드

| code | 의미 |
|---|---|
| `UNAUTHORIZED` | 인증 실패 또는 세션 만료 |
| `FORBIDDEN` | 권한 부족 |
| `NOT_FOUND` | 리소스 없음 |
| `VALIDATION_ERROR` | 입력값 검증 실패 |
| `RATE_LIMITED` | 요청 제한 초과 |
| `LOCKED` | 로그인 잠금 상태 |

---

## 2. 인증 API

### 2-1. 로그인

- `POST /auth/login`

요청:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

응답:

```json
{
  "success": true,
  "data": {
    "nextStep": "OTP_REQUIRED",
    "requiresOtp": true,
    "session": null
  }
}
```

또는 MFA가 필요 없으면:

```json
{
  "success": true,
  "data": {
    "nextStep": "AUTHENTICATED",
    "requiresOtp": false,
    "session": {
      "accessToken": "jwt-or-session-token",
      "expiresAt": "2026-04-21T12:34:56Z",
      "admin": {
        "id": "admin-1",
        "email": "admin@example.com",
        "name": "Super Admin",
        "role": "ADMIN"
      }
    }
  }
}
```

### 2-2. OTP 검증

- `POST /auth/mfa/verify`

요청:

```json
{
  "code": "246810"
}
```

응답:

```json
{
  "success": true,
  "data": {
    "session": {
      "accessToken": "jwt-or-session-token",
      "expiresAt": "2026-04-21T12:34:56Z",
      "admin": {
        "id": "admin-1",
        "email": "admin@example.com",
        "name": "Super Admin",
        "role": "ADMIN"
      }
    }
  }
}
```

### 2-3. 세션 조회

- `GET /auth/session`

용도:

- 새로고침 후 로그인 상태 복원
- `AuthSessionProvider`에서 초기 세션 확인

응답:

```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "admin": {
      "id": "admin-1",
      "email": "admin@example.com",
      "name": "Super Admin",
      "role": "ADMIN"
    }
  }
}
```

### 2-4. 로그아웃

- `POST /auth/logout`

용도:

- 명시적 로그아웃
- 세션 만료 또는 401 후 강제 로그아웃

응답:

```json
{
  "success": true
}
```

### 2-5. 로그인 실패/잠금

로그인 API는 아래 상황을 구분해 반환하는 것을 권장한다.

- `INVALID_CREDENTIALS`
- `LOCKED`
- `OTP_REQUIRED`
- `OTP_INVALID`

예시:

```json
{
  "success": false,
  "error": {
    "code": "LOCKED",
    "message": "로그인 시도가 너무 많습니다.",
    "details": {
      "remainingSeconds": 300
    }
  }
}
```

---

## 3. 대시보드 API

대시보드는 현재 화면상 아래 데이터가 필요하다.

- 현재 활성 사용자 수
- 서버 상태
- 기간별 신규 가입
- 기간별 신규 공고
- 기간별 커뮤니티 글
- 기간별 신고 접수
- 기간별 처리 완료
- 기간별 신고 수
- 우선 처리 항목

### 3-1. 대시보드 요약

- `GET /dashboard/summary?from=2026-04-14&to=2026-04-21`

응답:

```json
{
  "success": true,
  "data": {
    "activeUsers": 1280,
    "serverStatus": "OPERATIONAL",
    "newUsers": 315,
    "announcementsPosted": 24,
    "communityPosts": 842,
    "processedTasks": 201,
    "userReports": 18
  }
}
```

### 3-2. 추이 차트

- `GET /dashboard/timeline?from=2026-04-14&to=2026-04-21&granularity=day`

권장 의미:

- `reportedCount`: 신고 접수 건수
- `processedCount`: 처리 완료 건수

응답:

```json
{
  "success": true,
  "data": {
    "series": [
      { "label": "04-14", "reportedCount": 12, "processedCount": 4 },
      { "label": "04-15", "reportedCount": 18, "processedCount": 2 }
    ]
  }
}
```

참고:

- 현재 FE 차트 컴포넌트는 `notices` 한 개 시리즈만 그리고 있다.
- 대시보드의 실제 의도가 `신고/처리 타임라인`이라면, FE도 `reportedCount`와 `processedCount` 두 개 시리즈를 렌더링하도록 맞추는 편이 낫다.
- 지금 코드와의 임시 호환이 필요하면 `reportedCount -> notices`, `processedCount -> reports`로 매핑하는 식으로도 가능하다.

### 3-3. 우선 처리 항목

- `GET /dashboard/priorities`

응답:

```json
{
  "success": true,
  "data": [
    {
      "id": "N101",
      "type": "NOTICE",
      "targetLabel": "공고 #101",
      "reason": "스팸 신고 누적으로 즉시 검토 필요",
      "priority": true
    }
  ]
}
```

---

## 4. 사용자 관리 API

화면상 필요한 기능:

- 사용자 목록 조회
- 이름/이메일 검색
- 상태 필터
- 상세 프로필 조회
- 역할 변경
- 계정 정지/정지 해제
- 관리자 초대

### 4-1. 사용자 목록

- `GET /users?page=1&pageSize=20&query=alice&status=ACTIVE`

응답 필드 권장:

- `id`
- `name`
- `email`
- `role`
- `status`
- `createdAt`

### 4-2. 사용자 상세

- `GET /users/{userId}`

응답:

```json
{
  "success": true,
  "data": {
    "id": "U001",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2026-04-10",
    "lastLoginAt": "2026-04-21T08:00:00Z"
  }
}
```

### 4-3. 관리자 초대

- `POST /users/invite`

요청:

```json
{
  "email": "new.admin@example.com",
  "role": "MODERATOR"
}
```

### 4-4. 역할 변경

- `PATCH /users/{userId}/role`

요청:

```json
{
  "role": "MODERATOR"
}
```

### 4-5. 계정 정지 / 해제

- `POST /users/{userId}/suspend`
- `POST /users/{userId}/unsuspend`

추정된 추가 필드:

- `reason`
- `memo`

---

## 5. 실종 공고 API

화면상 필요한 기능:

- 공고 목록
- 상태 필터
- 상세 보기
- 수정 화면 진입
- 숨김 처리
- 복구
- 삭제

### 5-1. 공고 목록

- `GET /notices?page=1&pageSize=20&query=cat&status=LOST`

권장 응답 필드:

- `id`
- `title`
- `animalType`
- `status`
- `reporter`
- `reportedAt`
- `thumbnailUrl`

### 5-2. 공고 상세

- `GET /notices/{noticeId}`

권장 응답 필드:

- `id`
- `title`
- `content`
- `animalType`
- `status`
- `reporter`
- `reportedAt`
- `location`
- `images`
- `tags`
- `moderationHistory`

### 5-3. 공고 수정

- `PATCH /notices/{noticeId}`

요청 예시:

```json
{
  "title": "수정된 제목",
  "content": "수정된 본문",
  "status": "FOUND"
}
```

### 5-4. 공고 숨김

- `POST /notices/{noticeId}/hide`

### 5-5. 공고 복구

- `POST /notices/{noticeId}/restore`

### 5-6. 공고 삭제

- `DELETE /notices/{noticeId}`

---

## 6. 커뮤니티 API

화면상 필요한 기능:

- 게시글 목록
- 카테고리 필터
- 게시글 상세
- 게시글 삭제
- 카테고리 관리 진입

### 6-1. 게시글 목록

- `GET /community/posts?page=1&pageSize=20&query=puppy&category=QNA`

권장 응답 필드:

- `id`
- `title`
- `category`
- `author`
- `likes`
- `comments`
- `createdAt`

### 6-2. 게시글 상세

- `GET /community/posts/{postId}`

권장 응답 필드:

- `id`
- `title`
- `category`
- `author`
- `body`
- `likes`
- `comments`
- `createdAt`
- `updatedAt`
- `attachments`

### 6-3. 게시글 삭제

- `DELETE /community/posts/{postId}`

권장 추가 옵션:

```json
{
  "force": true,
  "reason": "policy_violation"
}
```

### 6-4. 카테고리 목록/관리

현재 UI에는 버튼만 있고 별도 화면은 확인되지 않았다.
권장 API:

- `GET /community/categories`
- `POST /community/categories`
- `PATCH /community/categories/{categoryId}`
- `DELETE /community/categories/{categoryId}`

---

## 7. 신고 관리 API

화면상 필요한 기능:

- 신고 목록
- 상세 대상 보기
- 신고자 목록 확인
- 대상 삭제 또는 경고
- 신고 처리 완료/반려

### 7-1. 신고 목록

- `GET /reports?page=1&pageSize=20&status=PENDING&targetType=NOTICE`

권장 응답 필드:

- `id`
- `targetType`
- `reason`
- `reporterCount`
- `status`
- `lastReportedAt`

### 7-2. 신고 상세

- `GET /reports/{reportId}`

### 7-3. 신고자 목록

- `GET /reports/{reportId}/reporters`

응답 예시:

```json
{
  "success": true,
  "data": [
    {
      "name": "User132",
      "comment": "Duplicated listing",
      "autoFlagged": false
    }
  ]
}
```

### 7-4. 대상 열기용 메타

화면에서 "대상 보기" 버튼이 필요하므로, 신고 대상 위치를 식별할 수 있어야 한다.

권장 응답 필드:

- `targetId`
- `targetUrl`
- `targetTitle`

### 7-5. 신고 조치

권장 API:

- `POST /reports/{reportId}/dismiss`
- `POST /reports/{reportId}/warn`
- `POST /reports/{reportId}/delete-target`
- `POST /reports/{reportId}/resolve`

요청 예시:

```json
{
  "memo": "중복 신고로 삭제 처리"
}
```

---

## 8. 알림 API

화면상 필요한 기능:

- 대상별 알림 작성
- 알림 전송
- 발송 이력 조회

### 8-1. 알림 전송

- `POST /notifications/send`

요청:

```json
{
  "target": "all",
  "title": "점검 안내",
  "body": "금일 23시부터 서버 점검이 진행됩니다."
}
```

`target` 값 권장:

- `all`
- `active`
- `specific`

### 8-2. 알림 발송 이력

- `GET /notifications/history?page=1&pageSize=20`

권장 응답 필드:

- `id`
- `title`
- `body`
- `target`
- `sentAt`
- `status`
- `deliveredCount`
- `failedCount`

### 8-3. 대상 사용자 선택

`specific` 발송을 지원하려면 아래가 필요할 수 있다.

- `GET /users?query=...`
- `GET /notifications/segments`

이 항목은 **추정**이다. 현재 FE 화면에는 대상 선택 UI가 단순화되어 있다.

---

## 9. 서비스 상태 / 운영 API

화면상 필요한 기능:

- 전체 서비스 상태 조회
- 개별 서비스 상태 조회
- 장애 이력 조회
- 수동 오버라이드
- 재시작 요청
- 로그 조회

### 9-1. 서비스 개요

- `GET /services/overview`

권장 응답 필드:

- `globalStatus`
- `services`

`services` 예시 필드:

- `id`
- `name`
- `status`
- `uptime`
- `latency`

### 9-2. 개별 서비스 상세

- `GET /services/{serviceId}`

권장 응답 필드:

- `id`
- `name`
- `status`
- `uptime`
- `latency`
- `cluster`
- `telemetry`
- `recentLogs`

### 9-3. 상태 수동 오버라이드

- `POST /services/override`

요청:

```json
{
  "target": "global",
  "status": "DEGRADED"
}
```

### 9-4. 재시작 요청

- `POST /services/{serviceId}/reboot`

### 9-5. 서비스 로그 조회

- `GET /services/{serviceId}/logs?limit=100`

---

## 10. 감사 로그 API

화면상 필요한 기능:

- 감사 로그 목록
- 관리자별 행위 추적
- IP 주소 확인

### 10-1. 감사 로그 목록

- `GET /audit-logs?page=1&pageSize=20&query=admin`

권장 응답 필드:

- `id`
- `adminName`
- `action`
- `target`
- `timestamp`
- `ipAddress`

### 10-2. 감사 로그 상세

- `GET /audit-logs/{logId}`

추정 필드:

- `before`
- `after`
- `metadata`

---

## 11. 설정 API

화면상 필요한 기능:

- 서비스명 변경
- 지원 이메일 변경
- 기본 언어 변경
- 로고 업로드/삭제
- FCM 키 관리
- 외부 API 엔드포인트 설정
- 알림/동기화 토글
- 기준 데이터 조회 및 수정

### 11-1. 설정 조회

- `GET /settings`

권장 응답 필드:

- `siteName`
- `supportEmail`
- `defaultLanguage`
- `logoUrl`
- `fcmServerKeyMasked`
- `apiEndpoint`
- `autoSyncEnabled`
- `globalPushEnabled`

### 11-2. 설정 저장

- `PATCH /settings`

요청:

```json
{
  "siteName": "PawGen",
  "supportEmail": "support@pawgen.com",
  "defaultLanguage": "ko",
  "apiEndpoint": "https://openapi.animal.go.kr/openapi/service/rest",
  "autoSyncEnabled": true,
  "globalPushEnabled": true
}
```

### 11-3. 로고 업로드

- `POST /settings/logo`

요청 방식 권장:

- `multipart/form-data`

### 11-4. 로고 삭제

- `DELETE /settings/logo`

### 11-5. FCM 키 업데이트

- `PATCH /settings/integrations/fcm`

요청:

```json
{
  "serverKey": "xxxxx"
}
```

### 11-6. 기준 데이터 조회

- `GET /reference-data`

권장 응답 필드:

- `animalTypesCount`
- `regionCodesCount`
- `noticeStatusLabelsCount`

### 11-7. 기준 데이터 편집

- `GET /reference-data/animal-types`
- `POST /reference-data/animal-types`
- `PATCH /reference-data/animal-types/{id}`
- `DELETE /reference-data/animal-types/{id}`

동일 패턴으로 아래도 필요하다.

- `region-codes`
- `notice-status-labels`

---

## 12. FE 구현 시 필요한 추가 메타

### 12-1. 권한/역할

현재 화면상 관리자 계정은 최소 아래 권한 분리가 필요하다.

- `ADMIN`
- `MODERATOR`
- `REPORT_MANAGER`
- `SERVICE_MANAGER`

이 값들은 **추정**이며 백엔드와 합의가 필요하다.

### 12-2. 상태값

화면에서 확인된 상태값은 아래와 같다.

- 사용자: `ACTIVE`, `INACTIVE`, `SUSPENDED`
- 실종 공고: `LOST`, `FOUND`, `RESOLVED`, `HIDDEN`, `REPORTED`
- 신고: `PENDING`, `REVIEWING`, `RESOLVED`, `REJECTED`
- 서비스: `OPERATIONAL`, `DEGRADED`, `OUTAGE`, `MAINTENANCE`

### 12-3. 파일 업로드

아래 기능은 파일 업로드를 지원해야 한다.

- 공고 이미지
- 프로필/로고 이미지

권장 방식:

- `multipart/form-data`
- 업로드 후 CDN/스토리지 URL 반환

---

## 13. 우선 구현 순서

1. 인증 API
2. 대시보드 요약/추이 API
3. 사용자 목록/상세/정지 API
4. 실종 공고 목록/상세/숨김/복구 API
5. 신고 목록/신고자/조치 API
6. 커뮤니티 목록/상세/삭제 API
7. 알림 전송/이력 API
8. 서비스 상태/오버라이드/로그 API
9. 감사 로그 API
10. 설정 및 기준 데이터 API

---

## 14. FE 쪽에서 바로 확인해야 할 질문

- 세션 방식은 JWT인지, 쿠키 세션인지
- MFA는 필수인지 선택인지
- 관리자 역할 체계가 실제로 어떻게 나뉘는지
- 공고/게시글/신고의 삭제가 soft delete인지 hard delete인지
- 알림 발송 대상의 `specific` 범위 정의가 무엇인지
- 기준 데이터는 FE에서 직접 수정 가능한지, 별도 관리 화면이 필요한지
