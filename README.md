# food-calorie-proxy

Swift 앱이 Anthropic API 키를 직접 들고 있지 않도록 감싸주는
Vercel 서버리스 프록시입니다.

## 배포 방법 (약 5분)

### 1. Anthropic API 키 발급
1. [console.anthropic.com](https://console.anthropic.com) 가입/로그인
2. 좌측 메뉴에서 **API Keys** → **Create Key**
3. 생성된 키를 복사해두기 (`sk-ant-...` 형태)

### 2. GitHub에 이 폴더 올리기
1. GitHub에서 새 저장소 생성 (예: `food-calorie-proxy`)
2. 이 폴더(`api/analyze.js`, `package.json`)를 그대로 push

```bash
cd food-calorie-proxy
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/내계정/food-calorie-proxy.git
git push -u origin main
```

### 3. Vercel에 배포
1. [vercel.com](https://vercel.com) 가입 (GitHub 계정으로 로그인 추천)
2. **Add New → Project** 클릭
3. 방금 만든 GitHub 저장소 선택 → **Import**
4. **Environment Variables**에 아래 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: (2번에서 복사한 키)
5. **Deploy** 클릭 → 1분 내로 배포 완료

### 4. 배포 완료 후 주소 확인
배포가 끝나면 다음과 같은 주소가 생깁니다:

```
https://food-calorie-proxy-xxxx.vercel.app/api/analyze
```

이 주소를 Swift 앱의 `FoodAnalysisService.swift`에 있는 `endpoint` 값으로
넣으면 끝입니다.

```swift
private let endpoint = URL(string: "https://food-calorie-proxy-xxxx.vercel.app/api/analyze")!
```

## 로컬에서 테스트하기 (선택)

```bash
npm install -g vercel
vercel dev
```

`http://localhost:3000/api/analyze`로 요청을 보내 테스트할 수 있습니다.

## curl로 동작 확인하기

```bash
curl -X POST https://food-calorie-proxy-xxxx.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "<base64 이미지 문자열>",
    "prompt": "이 사진 속 음식을 분석해서 다음 JSON 형식으로만 답해줘: {\"foodName\": \"음식명\", \"estimatedCalories\": 숫자, \"confidence\": \"high/medium/low\"}"
  }'
```

정상이라면 아래 형태의 JSON이 돌아옵니다:

```json
{
  "foodName": "김치찌개",
  "estimatedCalories": 350,
  "confidence": "medium"
}
```

## 주의사항

- `ANTHROPIC_API_KEY`는 절대 코드에 직접 적지 말고 Vercel 환경 변수로만 관리하세요.
- 무료 요금제로도 개인 프로젝트/포트폴리오 용도는 충분합니다.
- `Access-Control-Allow-Origin: "*"`은 테스트 편의를 위한 설정입니다. 실서비스로
  확장할 경우 도메인을 제한하는 것이 좋습니다.
