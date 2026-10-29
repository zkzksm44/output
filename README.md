# 톰슨팩토리 출고관리

모바일에서 출고 품목과 수량을 수기로 입력하고, 출고 구분별 소계와 전체 합계를 자동 계산하는 정적 웹앱입니다.

품명은 Supabase의 `shipping.products`에서 불러오며, 전체 품명이나 초성으로 검색할 수 있습니다.

화면 상단의 **엑셀 다운로드** 버튼으로 품명별 수량을 5개 출고 구분 열에 모은 테두리 표를 `.xlsx` 파일로 내려받을 수 있습니다.

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
2. **새 빈 SQL Editor 탭**에 [`01_create_shipping_schema.sql`](supabase/01_create_shipping_schema.sql)의 한 줄만 붙여넣고 실행합니다.
3. 기존 `public.shipping_journals`에 보존할 데이터가 있는 경우에만 [`migrate_from_public.sql`](supabase/migrate_from_public.sql)을 실행합니다. 최초 설치라면 이 단계는 건너뜁니다.
4. 다른 새 빈 탭에 [`02_create_shipping_journals.sql`](supabase/02_create_shipping_journals.sql)의 전체 내용을 붙여넣고 실행합니다. 기존 쿼리 내용을 이어 붙이지 마세요.
5. 다른 새 빈 탭에 [`03_create_products.sql`](supabase/03_create_products.sql)의 전체 내용을 실행합니다. 검게 지운 품목을 제외한 24개 품목이 등록됩니다.
6. `select to_regclass('shipping.journals'), to_regclass('shipping.products');`를 실행해 두 결과가 모두 표시되는지 확인합니다.
7. **Integrations → Data API → Exposed schemas**에 `shipping`을 추가합니다. `public`을 제거할지는 다른 기능의 사용 여부에 따라 결정합니다.
8. **Authentication → URL Configuration**에서 Site URL을 `https://zkzksm44.github.io/output/`으로 설정합니다.
9. 이메일 확인을 사용하는 경우 Redirect URLs에도 같은 주소를 추가합니다.

브라우저에는 공개 가능한 publishable key만 사용합니다. Secret 또는 service role 키는 프런트엔드에 추가하면 안 됩니다.
