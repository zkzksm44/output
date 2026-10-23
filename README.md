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

출고 데이터는 Supabase에 날짜별로 저장되며 같은 계정으로 로그인한 기기에서 공유됩니다. 네트워크 오류에 대비해 현재 날짜의 편집 내용은 브라우저에도 임시 저장됩니다.

### Supabase 최초 설정

1. Supabase 프로젝트의 **SQL Editor**를 엽니다.
2. 신규 설정이거나 기존 테이블에 보존할 데이터가 없다면 [`supabase/schema.sql`](supabase/schema.sql)의 전체 내용을 실행합니다.
3. 기존 `public.shipping_journals`에 보존할 데이터가 있다면 먼저 [`supabase/migrate_from_public.sql`](supabase/migrate_from_public.sql)을 실행하고, 이어서 `schema.sql`을 실행합니다.
4. **Integrations → Data API → Exposed schemas**에 `shipping`을 추가합니다. `public`을 제거할지는 다른 기능의 사용 여부에 따라 결정합니다.
5. **Authentication → URL Configuration**에서 Site URL을 `https://zkzksm44.github.io/output/`으로 설정합니다.
6. 이메일 확인을 사용하는 경우 Redirect URLs에도 같은 주소를 추가합니다.

브라우저에는 공개 가능한 publishable key만 사용합니다. Secret 또는 service role 키는 프런트엔드에 추가하면 안 됩니다.
