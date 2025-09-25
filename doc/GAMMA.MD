```plantuml
@startuml
start
:사용자 [감마 측정하기] 버튼 클릭;
:로그 파일 삭제(deleteFile);
:서브 창(SubWindow) 열기;
:계조값  = 0; 
repeat
  :서브 창 → 계조값 출력;
  :CA-410 장비 휘도측정 명령 전송 (COM, MMS, MES);
  :계조값 4 증가 (최대 255);
  :CA-410 응답 데이터 수신(휘도);
  :log.txt 에 측정값 추가;
repeat while (측정 완료 아님?)
:측정 완료;
:서브 창 닫기;
:사용자 [결과 다운로드] 버튼 클릭;
:서버 /downloadgamma API 호출;
:log.txt → gamma.xlsx 변환 (readTextWriteExcel);
:엑셀 파일 스트리밍 응답;
stop
@enduml
  ```
