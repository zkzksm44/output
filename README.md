# 톰슨팩토리 출고관리

모바일에서 출고 품목과 수량을 수기로 입력하고, 출고 구분별 소계와 전체 합계를 자동 계산하는 정적 웹앱입니다.

## 로컬 실행

별도 빌드나 패키지 설치가 필요하지 않습니다.

```powershell
node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,s)=>{let x=decodeURIComponent(q.url.split('?')[0]);if(x==='/')x='/index.html';f.readFile(p.join(process.cwd(),x),(e,d)=>{if(e){s.writeHead(404);return s.end('Not found')}s.end(d)})}).listen(4173)"
```

브라우저에서 `http://127.0.0.1:4173`을 엽니다.

## GitHub Pages 배포

`.github/workflows/deploy-pages.yml`이 포함되어 있어 `main` 브랜치에 푸시하면 자동 배포됩니다.

1. GitHub 저장소의 **Settings → Pages**로 이동합니다.
2. **Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
3. 로컬 변경사항을 커밋하고 `main` 브랜치로 푸시합니다.
4. **Actions** 탭에서 `Deploy to GitHub Pages` 완료 여부를 확인합니다.

예상 주소: `https://zkzksm44.github.io/output/`

## 운영 전 권장사항

현재 입력 내용은 브라우저 메모리에만 유지되며 새로고침하면 초기화됩니다. 실제 운영에는 데이터베이스, 사용자 인증, 출고일지 저장 API 및 백업 정책이 추가로 필요합니다.
