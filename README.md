# food-calorie-proxy (무료 버전 - Google Gemini API 사용)

Swift 앱이 API 키를 직접 들고 있지 않도록 감싸주는 Vercel 서버리스 프록시입니다.
**Google Gemini API**를 사용하며, 신용카드 등록 없이 완전 무료로 쓸 수 있습니다.

> 무료 등급은 요청 횟수 제한(분당/일일)이 있지만, 개인 프로젝트나 포트폴리오
> 시연용으로는 충분합니다.

## 배포 방법 (약 5분, 전부 아이패드 Safari로 가능)

### 1. Gemini API 키 발급 (무료, 카드 불필요)
1. Safari에서 [aistudio.google.com](https://aistudio.google.com) 접속
2. 구글 계정으로 로그인
3. **Get API key** 클릭 → **Create API key**
4. `AIzaSy...` 형태의 키가 생성됨 → 복사해서 메모 앱에 잠깐 저장

### 2. GitHub에 이 폴더 올리기
1. [github.com](https://github.com) 가입 (이메일만 있으면 됨)
2. 새 저장소 생성 (예: `food-calorie-proxy`)
3. 저장소 화면의 **uploading an existing file** 링크 클릭
4. 이 폴더 안의 `api/analyze.js`, `package.json`, `README.md`를 드래그해서 업로드
5. **Commit changes**

### 3. Vercel에 배포
1. [vercel.com](https://vercel.com) 가입 → **Continue with GitHub**으로 로그인
2. **Add New → Project** → 방금 만든 저장소 선택 → **Import**
3. **Environment Variables**에 추가:
   - Key: `GEMINI_API_KEY`
   - Value: (1번에서 복사한 키)
4. **Deploy** 클릭

### 4. 완료 후 주소 확인
배포가 끝나면 이런 주소가 생깁니다:

```
https://food-calorie-proxy-xxxx.vercel.app/api/analyze
```

이 주소를 Swift 앱 `FoodAnalysisService.swift`의 `endpoint`에 넣으면 끝입니다.

```swift
private let endpoint = URL(string: "https://food-calorie-proxy-xxxx.vercel.app/api/analyze")!
```

## curl로 동작 확인하기

```bash
curl -X POST https://food-calorie-proxy-xxxx.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "<base64 이미지 문자열>",
    "prompt": "이 사진 속 음식을 분석해서 다음 JSON 형식으로만 답해줘: {\"foodName\": \"음식명\", \"estimatedCalories\": 숫자, \"confidence\": \"high/medium/low\"}"
  }'
```

## 무료 등급 한도 참고

- 분당/일일 요청 횟수 제한이 있음 (모델에 따라 다름, 넉넉한 편)
- 무료 등급 사용 시 요청/응답 데이터가 구글 서비스 개선에 활용될 수 있다는 점 참고
- 한도가 부족해지면 그때 결제 계정을 연결해 유료로 전환 가능 (선택 사항)

## 주의사항

- `GEMINI_API_KEY`는 절대 코드에 직접 적지 말고 Vercel 환경 변수로만 관리하세요.
- `Access-Control-Allow-Origin: "*"`은 테스트 편의를 위한 설정입니다. 실서비스로
  확장할 경우 도메인을 제한하는 것이 좋습니다.
