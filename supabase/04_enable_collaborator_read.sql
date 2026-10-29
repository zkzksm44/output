-- 로그인한 협업 담당자가 모든 날짜의 출고일지를 조회할 수 있게 합니다.
-- 작성, 수정, 삭제 권한은 기존처럼 본인이 만든 출고일지에만 적용됩니다.

drop policy if exists shipping_journals_collaborator_read on shipping.journals;

create policy shipping_journals_collaborator_read
on shipping.journals
for select
to authenticated
using (true);
