/* ---------------- speakers ---------------- */
const SPK={
  '이든':{c:'#b49bff',img:'eden',full:'대행자 이든'},
  '네시스':{c:'#9fdcff',img:'nesis',full:'집행자 네시스'},
  '센티아':{c:'#59c8ff',e:'센',full:'센티아'},
  '센수스':{c:'#c77dff',e:'수',full:'센수스'},
  '클라우스룸':{c:'#eef3ff',e:'클',full:'클라우스룸'},
  '이럽디오':{c:'#5aa9ff',e:'이',full:'이럽디오'},
  '에토스':{c:'#cfdcea',e:'E',full:'대 기록관 에토스'},
  '파토스':{c:'#a8c3dd',e:'P',full:'파토스'},
  '뮤토스':{c:'#a8c3dd',e:'M',full:'뮤토스'},
  '카이로스':{c:'#a8c3dd',e:'K',full:'카이로스'},
  '렉소르':{c:'#ff6b5b',e:'렉',full:'렉소르 · 분노의 우니타스'},
  '콘투수스':{c:'#ff8f6b',e:'콘',full:'콘투수스 · 분노의 우니타스'},
  '투몰투스':{c:'#ffa07a',e:'투',full:'투몰투스 · 분노의 우니타스'},
  '가우디움':{c:'#ffd166',e:'가',full:'가우디움 · 기쁨의 파레스'},
  '액슐탄스':{c:'#ffd166',e:'액',full:'액슐탄스 · 기쁨의 몰레스'},
  '엘라':{c:'#ffe08a',e:'엘',full:'엘라 · 기쁨의 레비스'},
  '이라':{c:'#ff5c5c',e:'이',full:'이라 · 분노의 파레스'},
  '아르간트':{c:'#e0c3ff',e:'아',full:'아르간트 · 교만의 파레스'},
  '파보르':{c:'#7fa6c9',e:'파',full:'파보르 · 두려움의 몰레스'},
  '루구스':{c:'#6c8fb3',e:'루',full:'루구스 · 슬픔의 몰레스'},
  '페스타디움':{c:'#d4b5ff',e:'페',full:'페스타디움 · 교만의 몰레스'},
  '푸로르':{c:'#ff4d4d',e:'푸',full:'푸로르 · 분노의 몰레스'},
  '카로':{c:'#b07cff',e:'카',full:'카로 · 변이의 초석 부하'},
  '오사':{c:'#9a7cff',e:'오',full:'오사 · 변이의 초석 부하'},
  '아비':{c:'#b46cff',e:'아',full:'아비 · 강림의 초석 부하'},
  '모르':{c:'#9a9ab8',e:'모',full:'모르 · 강림의 초석 부하'},
  '파시스':{c:'#d08cff',e:'파',full:'파시스 · 강림의 초석'},
  '안식의 마을 주민':{c:'#b8b0a0',e:'民',full:'안식의 마을 주민'},
};

/* ---------------- script ---------------- */
const RAW={
0:`#card 제 0막 프롤로그|침묵의 약속
@bg tower
> 1,000일 전, 모든 인과가 뒤바뀐 그날.
> '흡융의 탑' 최상층은 비명과도 같은 사슬 소리로 가득했다. 집행자 네시스는 증오에 미쳐 날뛰었고, 대행자 이든은 그녀의 목을 겨누는 대신 손을 뻗었다.
> 그것은 처단이 아닌 포식이었다.
> 이든의 권능 [태초의 공허]가 네시스를 좀먹던 저주와 업보를 통째로 삼켰다. 텅 빈 그릇이 된 그녀의 영혼에 죽은 리라의 용서가 깃들어, 새로운 신격의 씨앗이 맺혔다.
> 이든은 그 신격을 봉인하고, 그날의 진실을 그녀의 기억에서 지운 채 평범한 소녀로서의 삶을 선물하려 했다.
> 하지만 이든은 몰랐다. 네시스가 단 한 순간도 잊지 않았음에도, 그가 바란 '평범한 소녀'를 연기하며 침묵을 선택했다는 것을.
@bg forge
> 공허와 흡융의 대 전쟁이 끝난 지 정확히 3년. 잿빛 폐허 위로, 하늘을 뒤덮은 공허의 게이트가 차가운 빛의 가루를 소리 없이 흩뿌린다.
> 스테일 마을의 낡은 대장간. 대행자 이든은 1,000일이 넘는 시간 동안 이곳을 지켰다. 그는 신의 권능을 가진 채, 가장 인간답게 이 잿빛 시간을 견뎌왔다.
이럽디오: 네시스님, 저 하늘의 공허의 게이트가 오늘따라 유독 기분 나쁘게 번뜩입니다. 3년이나 참았으면 이제 저 가짜 하늘을 찢어발길 때도 되지 않았습니까?
클라우스룸: 입 다물어라, 이럽디오. 저 너머는 켄오바의 영역이다. 게이트 이면의 정체조차 파악하지 못한 채 덤벼드는 건 자살 행위나 다름없어.
이럽디오: 침착? 3년 동안 썩어가는 이 무덤에서 침착만 하다가 죽을 거냐!
> 똑— 똑— 굳게 닫혀 있던 대장간의 낡은 문 너머로 규칙적인 노크음이 들려왔다.
> 쏟아져 들어온 것은 회색 빛이 아닌, 인공적이고 차가운 백색 조명. 정밀한 푸른 회로가 새겨진 무장을 갖춘 집단이 서 있었다.
에토스: 이든님, 그리고 네시스님. 시간이 되었습니다.
네시스: 아카이브... 결국 올 것이 왔나 봐. 우리가 억지로 붙잡고 있던 이 시간도...
에토스: 백의 관측탑에서 공허의 게이트 내부에 이상한 에너지가 움직이는 것을 관측했습니다. 거짓된 평화라 해도, 더 이상 유지되기는 힘들어 보입니다.
> 이든은 3년 동안 손때가 묻은 모루를 마지막으로 한 번 쓸어내렸다.
이든: ......가자. 더 이상 미룰 수는 없겠군.
@bg ark
> 눈 깜짝할 사이 공간이 접혀 들어갔다. 다시 눈을 떴을 때 보인 것은 하늘 높이 솟은 백의 관측탑과 거대한 중앙 기록소, 그리고 열기를 내뿜는 백의 대장간이었다.
에토스: 어서 오십시오. 인류의 마지막 연대기이자, 신들에게 대항할 유일한 연산 장치. 저희의 방주, 레지스트리에 오신 것을 환영합니다.`,

1:`#card 제 1막|재회와 잿빛 평화
@bg ark
> 3년 전 광신에 젖어 있던 아카이브의 모습은 온데간데없었다. 푸른 격자무늬의 렐리움 회로들이 신경계처럼 뻗어 나가며 공간을 지탱하고 있었다.
센수스: 우와! 쟤네들 진짜 3년 사이에 딴사람이 됐네? 이든, 저기 떠다니는 푸른 빛들 다 뭐야?
센티아: 비효율적인 신앙심을 버리고 실용적인 무력을 택한 결과지. 저들의 장비는 현계 신의 인과율 고정 기술을 일부 복제한 것으로 보여.
에토스: 먼저 두 분의 능력치를 재검사해 볼 필요가 있겠군요. 이든 님의 출력값은 여전히 안정적입니다. 하지만 네시스 님은 상황이 다릅니다.
에토스: 네시스 님, 당신은 이든 님이 배려로 만들어준 그 침묵 속에서도 단 한 번도 '망각'을 선택하지 않으셨더군요.
> 이든의 눈이 미미하게 커졌다. 네시스의 기억이 지워지지 않았다는 사실을, 그는 처음 알게 되었다.
네시스: 나를 속이지 않아도 돼, 이든. 나는 단 한 순간도 잊은 적 없으니까. 네가 만들어준 그 따뜻한 시간 속에서, 나는 내 힘을 증명할 준비를 마쳤어.
이든: ……미안하다. 네가 혼자 그 기억과 힘을 감당하게 해서.
네시스: 아니야. 덕분에 3년 동안 정말 따뜻했으니까.
@bg chamber
에토스: 이 안식은 유통기한이 다했습니다. 에테르 시뮬레이션 챔버를 기동하죠. 시뮬레이션 중 입은 부상은 종료 시 모두 회복되니, 걱정 말고 연습하십시오.
센수스: 와! 이거 진짜 같다! 이든, 저기 큰 놈은 내가 쪼개버릴게! 헤헤, 신난다!
센티아: 적당히 좀 날뛰어! 이든 손목 나가는 꼴 보기 싫으니까 제대로 휘두르기나 해!
!battle tut
에토스: 방금 전의 출력값은 3년 전과는 비교도 할 수 없을 만큼 선명하군요. 이것이 대행자 님에 대한 진심 어린 신뢰의 결과입니까?
네시스: ……! 그런 걸... 입 밖으로 내지 않아도 되잖아, 에토스.
이든: ....충분하다. 네시스.
> 네시스는 작은 목소리로 대답하며, 이든의 옷자락을 아무도 모르게 살짝 붙잡았다.
센수스: 헤헤, 역시 둘이 같이 있을 때가 제일 보기 좋아! 그치, 센티아?
센티아: 누가 그래? …뭐, 이번 합은 아주 조금... 아주 조금 봐줄 만했어. 다음부턴 더 잘하라고.
에토스: 방금 여러분이 상대한 것은 '과거의 잔영'일 뿐입니다. 그 3년 동안, 공허체와 폴른은 저희 몰래 진화를 준비하고 있었을지도 모릅니다.
이든: ……숙명이라. 이미 알고 있다. 평화는 늘 폭풍 전야처럼 짧았으니까.
이든: 그나저나 그 켄오바라는 것은 무엇을 말하는 거지?
에토스: 여러분이 흔히 '저편의 세계'라고 부를 곳입니다. 네시스님의 무구 콘솔라티오 두 자루도, 바로 켄오바에서 넘어온 존재지요.
> 무구들이 아카이브의 연산과 자연스럽게 맞물려 돌아가는 모습을 볼 때마다, 네시스의 가슴 한구석에는 서늘한 소외감이 스쳐 지나갔다.
파토스: 아카이브의 감정 공학 및 의상 설계를 담당하는 파토스입니다. 이 의복에는 나노 렐리움 기술이 집약되어 있지요. 전투 중 훼손되더라도 실시간으로 구조를 재구성합니다.
카이로스: 그리고 이 브로치는 아카이브의 중앙 연산 장치 '라그나'와 여러분을 잇는 단말기입니다.
뮤토스: 켄오바의 유산인 콘솔라티오라... 흥미롭군. 나중에 시간이 나면 내 작업실로 올 수 있겠는가?
@bg plaza
> 챔버를 나선 일행이 처음 발을 디딘 곳은 레지스트리의 중앙 광장. 신분이나 출신에 상관없이 누구나 편히 쉬며 물건을 주고받는 곳이었다.
안식의 마을 주민: ……죄송합니다. 과거 우리가 당신들에게 거짓된 안식만을 강요했던 것을, 이제야 깨달았습니다.
이든: 정말 이곳은 활기찬 기운으로 가득한 곳이군... 나쁘지만은 않아.
센수스: 와아! 맛있는 냄새가 엄청 많아! 이든, 저기 파는 거 뭐야? 과자다! 나 저거 먹어볼래!
네시스: 센수스, 그건 저의 마을에서 아이들이 즐겨 먹던 보리 과자예요. 씹을수록 고소하고 달콤해서… 당신 입맛에도 잘 맞을 것 같아요.
> 이든은 말없이 과자 몇 봉지를 샀다. 에고들이 옹기종기 모여 과자를 나눠 먹는 모습에, 네시스의 얼굴에도 비로소 옅은 미소가 번졌다.
@bg unity
> 우니타스의 본진, 유니티 하우스의 통합 로비. 이든과 네시스가 나타나자 우니타스 인원들이 일제히 동작을 멈췄다.
가우디움: 대행자 이든, 그리고 네시스님. 에토스 님께 말씀 전해 들었습니다. 3년 만이군요.
네시스: 저... 지난번에는... 죄송했어요. 제가 여러분께 큰 상처를...
가우디움: 에이, 사과는 됐습니다! 저기 가판대 과자 사 오신 겁니까? 그거 광장에서 제일 인기 있는 건데, 센스 있으시네요!
이라: 흥, 사과 한 봉지로 3년의 앙금이 다 씻길 거라 생각하나 보군.
아르간트: …지켜보겠다. 네가 과거의 그 파괴적인 힘을 통제할 자격이 있는지, 아니면 여전히 불안정한 시한폭탄에 불과한지 말이다.
액슐탄스: 과거는 과거일 뿐입니다. 지금은 우리와 함께 방주를 지키는 동료 아닙니까?
엘라: 맞아요. 그 과자, 저희도 정말 좋아하거든요.
이든: ......다행이군.
@bg alert
> 하지만 그 따뜻한 순간도 잠시, 유니티 하우스의 대형 스크린에 붉은 경고등이 들어왔다. 백의 관측탑으로부터 온 긴급 신호였다.
에토스: 우려하던 변이체들이 나오기 시작했습니다! 켄오바의 공허 기운에 직접 노출되어, 기존의 공허체와 폴른들이 변이한 것 같습니다!
이든: 적들이 나타난 정확한 위치는 어디지?
에토스: 제1 전초기지입니다! 분노의 우니타스 대원들이 방어를 맡고 있는 구역입니다!
이라: 흥, 제1 전초기지라면 렉소르 애들이 있는 곳이군. 오히려 잘됐어. 우리도 3년 동안 놀고만 있지 않았다는 걸 보여줄 차례군.
이든: 확실히 공허 게이트의 기운이 느껴지는군... 걱정 마라, 네시스. 저 게이트에서 무엇을 보내든, 내가 전부 포식할 테니까.
네시스: 응!! 난 이든을 믿어요.`,

2:`#card 제 2막|창조의 사냥개와의 전투
@bg alert
에토스: 공허체들의 침입 방향은 제1 전초기지 쪽입니다. 간이 방어막 수치가 위험 수준인 12%까지 떨어졌습니다. 3분 내에 물리적 돌파를 허용하게 됩니다.
이든: 이곳에서 그곳까지의 거리는?
에토스: 직선거리로 약 45km입니다. 일반적인 기동 부대로는 아무리 서둘러도 2시간 이상이 소요됩니다.
네시스: 2시간이라니... 도착하기 전에 전초기지의 인원들이 전부 사망하고 말 거예요. 이든, 무슨 방법이 없는 걸까?
에토스: 두 분이 입고 계시는 의상에는 아카이브의 공간 전이 시스템과 동기화할 수 있는 리미터가 내장되어 있습니다.
이든: 에토스, 제1 전초기지에 긴급 통신을 연결해라. 우리가 도착하기 30초 전, 방어막을 완전히 해제하라고 전해.
렉소르: 제정신입니까, 이든 님?! 방어막을 해제하면 30초도 버티지 못하고 괴물들에게 찢길 겁니다!
이든: 렉소르, 무슨 일이 있어도 그 전에 도착한다고 약속하지. 그러니 나를 믿고 방어막을 해제해라.
렉소르: 좋습니다, 믿어보죠! 전원, 긴장을 풀지 말도록!! 방어막 해제 10초 전!
@bg outpost
> 방어막이 사라진 찰나의 공백을 뚫고, 푸른 궤적이 지면을 강타했다. 먼지 구름 사이로 이든과 네시스가 모습을 드러냈다.
네시스: 늦지... 않았죠? 분노의 우니타스 여러분!
콘투수스: ......하아, 죽는 줄 알았네. 렉소르 형, 방어막 끄라고 할 때 진심으로 유서라도 써놓을걸 하고 후회했다고요!
투몰투스: 투덜대지 마, 콘투수스. 덕분에 우린 살았으니까.
렉소르: 잡담은 나중에 해! 대행자님이 길을 여셨으니, 우린 그 뒤를 받친다. 분노의 우니타스, 놈들의 심장부를 짓눌러버려! 간다!
!battle outpost
렉소르: 후우... 정말이지, 미친 도박이었습니다. 하지만 대행자님 말씀대로 당신들이 새로운 '방패'가 되어주셨군요.
렉소르: 방어막 재가동 완료. 제1 전초기지, 위기 상황 종료를 보고합니다.
이든: ...단순한 진화가 아니군. 놈들은 우리의 공격 방식을 학습하고 있다.
에토스: 분석 결과... 금속화된 외피가 손톱 끝까지 코팅되어 있습니다. 놈들은 방어막 파장의 한 점에 힘을 집중해 짓이기고 있었습니다.
이든: 이제부터는 시스템이 아니라, 우리가 직접 놈들의 근원을 끊어야 할 때군.
@bg cliff
> 그 뒷모습을, 전장 너머 어두운 절벽 위에서 두 개의 기괴한 그림자가 지켜보고 있었다. 창조의 신 테흠의 계보, 변이의 초석 무타티오의 심복들이었다.
카로: ...보았니, 오사? 저것이 무타티오 님께서 경계하시던 '포식자'의 힘이야. 우리 아이들의 금속질 외피마저 단숨에 녹여버리다니, 제법 맛깔나는 힘이네.
오사: 이번에는 확실히 수확이 있군. 저 거지 같던 방어막에 확실히 대미지가 박히고 있어.
카로: 후후후... 판이 더 재미있어지겠어. 가서 보고드리자고. 무타티오 님께서 기다리고 계셔.
@bg moles
> 제1 거점 기지, 우니타스 몰레스. 회의실에 무거운 침묵이 내려앉았다.
이든: 방어막은 더 이상 절대적인 벽이 아니다. 놈들이 우리 시스템을 완전히 파악하기 전에, 우리가 먼저 놈들의 근거지를 친다.
파보르: 잠깐!!! 강한 자네들이라면 문제없겠지! 하지만 다른 인원들은? 자네에게 그들은 그저 승리를 위해 던져지는 장기말이라는 것인가!
루구스: 이미 전초기지에서 많은 아이들이 돌아오지 못했습니다. 여기서 더 나가는 것이 과연 구원일지, 아니면 그저 죽음을 앞당기는 일일지... 가슴이 아프군요.
페스타디움: 우리 몰레스의 방어막은 아카이브의 정수야. 굳이 데이터도 부족한 적진으로 정예병들을 보낼 필요가 있나?
투몰투스: 페스타디움 지휘관님, 저희는 현장에서 그 방어막이 짓이겨지는 소리를 직접 듣고 왔습니다. 놈들은 우리의 '기다림'을 학습의 기회로 삼고 있습니다.
이든: 파보르, 네가 아끼는 병사들이 언제 가장 많이 죽는지 아나? 우리가 여기서 가장 안전한 대책을 세우려 망설이는 '지금 이 순간'이다.
네시스: 지휘관님들의 걱정, 충분히 알아요. 하지만 저희는 현장에서 직접 봤어요. 놈들은 우리가 멈춰있는 시간을 먹고 자라요.
푸로르: ...좋군. 회의는 여기까지 하지. 이든, 자네가 길을 열겠다면 우리 몰레스도 후방 지원을 아끼지 않겠다. 다만, 반드시 살아서 돌아와야 할 거야.
@bg waste
> 원정대는 전술 차량을 타고 제5 외곽 폐기 구역에 도착했다. 폐기물 집하장 중심부의 게이트로부터 베리언트 에너지의 방출이 급증하고 있었다.
모르: ...왔나. 파시스 님께서 말씀하신 '성가신 쥐새끼들'이.
아비: 어머, 모르. 쥐새끼치고는 제법 눈빛이 살아있는데? 특히 저 보랏빛 눈의 인간... 무타티오 님이 직접 눈독을 들이시는 이유를 이제야 알겠어.
센티아: 흥! 딱 봐도 머릿속까지 베리언트 에너지에 절여진 것들이 말은 많네!
클라우스룸: 저들은 단순한 괴수가 아니다. 제5 초석 파시스의 의지를 직접 수행하는 '사자'. 네시스님, 아비의 창끝을 보지 마십시오.
이든: 렉소르, 콘투수스, 투몰투스! 너희는 모르를 맡아라! 네시스, 아비는 우리가 상대한다!
아비: 날 상대하겠다고? 귀여워라. 그럼 그 눈이 공포로 물드는 과정을 지켜봐 줄게!
!battle abimor
[sys] 시스템 경보: 하급 피조물 '아비'의 정수를 흡수합니다.
[sys] 권능 '강림의 초석: 끝없는 심연'의 파편을 포식합니다.
[sys] 시스템 경보: 하급 피조물 '모르'의 정수를 흡수합니다.
[sys] 권능 '강림의 초석: 예정된 종말'의 파편을 포식합니다.
클라우스룸: 사자는 잘려 나갔다. 하지만 머리는 살아있지. 파시스는 자신의 수족이 잘린 고통을 실시간으로 느꼈을 것이다. 네시스여, 이제 진정한 전쟁이 시작된다.
@bg phasis
> 하늘을 뒤덮은 보랏빛 안개가 거대한 소용돌이를 일으켰다. 지면의 고철들이 자석에 이끌리듯 떠올라 금속 실로 얽히며, 하나의 형상을 빚어냈다.
파시스: 나의 수족들을 꺾고, 게이트의 질서를 어지럽힌 쥐새끼들이 너희냐.
센티아: 이든, 조심해! 방금 잡은 애들이랑은 차원이 달라. 저 금속 날개 하나하나가 공간을 찢어발기는 살상 무기야!
센수스: 이든! 저 아줌마한테서 엄청 기분 나쁜 냄새가 나! 이든을 괴롭히면 내가 다 물어뜯어 버릴 거야! 앙!
이든: 그래, 센수스. 네 힘이 필요하다. 센티아는 적의 사각을 계속 읽어줘.
이럽디오: ...주인의 길을 막는다면, 그게 초석이라 해도 녹여버릴 뿐이다. 간다, 네시스!
파시스: 가소롭구나. 너희의 그 보잘것없는 의지가 얼마나 허망하게 무너질지... 내 요람의 양분이 되어 깨닫게 해주마!
!battle phasis
> 파시스의 육체가 고철 가루가 되어 흩어지는 와중에도, 그녀의 보랏빛 눈동자만큼은 끈질기게 이든과 네시스를 응시하고 있었다.
파시스: 아하하... 대행자 이든, 그리고 네시스... 너희가 거둔 이 하찮은 승리가 어떤 파멸을 불러올지, 아직도 모르는구나.
파시스: 착각하지 마라. 나의 소멸은 끝이 아니다. 만물을 창조하시는 나의 신, 테흠께서 네놈들이 게이트를 욕되게 한 죄를 결코 잊지 않으실 테니까.
> 그녀가 있던 자리에는 사념과 권능이 응축된 '보랏빛 보석 결정' 하나만이 덩그러니 남았다.
센수스: 이든... 이 보석 엄청 반짝거려. 근데... 나쁜 괴물들이 또 올 거라는 엄청 슬픈 목소리가 들리는 것 같아.
센티아: 이든, 센수스의 말이 맞아! 이 결정 안에서 아주 미세하고 규칙적인 파동이 발신되고 있어. 이건... 일종의 '좌표 신호'야!
클라우스룸: 네시스여, 경계하십시오! 사자가 죽어 남긴 결정은 동족들을 부르는 등불입니다. 이계의 다른 초석들... 어쩌면 현계의 초석들까지 이 힘을 감지했을 것입니다.
네시스: 우리가... 양쪽 모두에게 표적이 됐다는 뜻인가요? 우린 그저 지키기 위해 싸운 것뿐인데...
> 이든은 결정을 손바닥 위에 올렸다. 날뛰던 파동이 공허 속에서 억눌리며, 점멸 속도가 눈에 띄게 줄어들었다.
이든: 완전히 지울 수는 없군. 하지만 적어도 실시간 위치 추적은 막아두었다. 이제부터 이놈은 우리를 사냥하는 미끼가 아니다.
!end`
};
const CHAPTERS=[
  {n:'제 0막 프롤로그',t:'침묵의 약속',d:'스테일 마을의 대장간, 그리고 방주로'},
  {n:'제 1막',t:'재회와 잿빛 평화',d:'에테르 챔버 전투 튜토리얼 · 유니티 하우스'},
  {n:'제 2막',t:'창조의 사냥개와의 전투',d:'제1 전초기지 방어전 · 아비 & 모르 · 파시스'},
];
function parseScript(src){
  return src.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{
    if(l.startsWith('#card ')){const[a,b]=l.slice(6).split('|');return{t:'card',n:a,x:b};}
    if(l.startsWith('@bg '))return{t:'bg',bg:l.slice(4).trim()};
    if(l.startsWith('!battle '))return{t:'battle',id:l.slice(8).trim()};
    if(l==='!end')return{t:'end'};
    if(l.startsWith('> '))return{t:'nar',x:l.slice(2)};
    if(l.startsWith('[sys] '))return{t:'sys',x:'[ '+l.slice(6)+' ]'};
    const i=l.indexOf(': ');
    if(i>0&&i<12)return{t:'say',n:l.slice(0,i),x:l.slice(i+2)};
    return{t:'nar',x:l};
  });
}
const SCRIPT={};for(const k in RAW)SCRIPT[k]=parseScript(RAW[k]);

/* ---------------- runner ---------------- */
const run={ch:0,i:0};
let D={full:'',shown:0,typing:false,auto:false,autoT:0,step:null};
function startChapter(n){
  run.ch=n;run.i=0;
  show('title',false);show('chap',false);show('fin',false);
  nextStep();
}
function nextStep(){
  const list=SCRIPT[run.ch];
  const st=list[run.i++];
  if(!st){
    if(run.ch+1>SAVE.unlocked){SAVE.unlocked=run.ch+1;persist();}
    if(SCRIPT[run.ch+1])startChapter(run.ch+1);else finish();
    return;
  }
  if(st.t==='bg'){GS.bg=st.bg;GS.bgT=0;return nextStep();}
  if(st.t==='card'){showCard(st);return;}
  if(st.t==='battle'){hideDialog();startBattle(st.id);return;}
  if(st.t==='end'){hideDialog();finish();return;}
  showLine(st);
}
function showCard(st){
  hideDialog();GS.mode='card';
  $('cardN').textContent=st.n;$('cardT').textContent=st.x;
  const c=$('card');show('card',true);requestAnimationFrame(()=>c.classList.add('on'));
  SFX.boss();
  let done=false;
  const go=()=>{if(done)return;done=true;c.classList.remove('on');c.onclick=null;setTimeout(()=>{show('card',false);nextStep();},450);};
  c.onclick=go;setTimeout(go,2600);
}
function showLine(st){
  GS.mode='dialog';D.step=st;
  show('dlg',true);show('dlgbar',true);
  const dl=$('dlg');dl.classList.toggle('nar',st.t==='nar');dl.classList.toggle('sys',st.t==='sys');
  const por=$('dPor');por.innerHTML='';
  if(st.t==='say'){
    const s=SPK[st.n]||{c:'#ddd',e:st.n[0],full:st.n};
    $('dNm').textContent=s.full;$('dNm').style.color=s.c;
    if(s.img&&IMG[s.img]){const im=document.createElement('img');im.src=IMG_SRC[s.img];por.appendChild(im);}
    else{const e=document.createElement('div');e.className='emb';e.style.color=s.c;e.textContent=s.e||st.n[0];por.appendChild(e);}
    por.style.display='';
  }else{$('dNm').textContent=st.t==='sys'?'SYSTEM':'';$('dNm').style.color='#8fd8ff';por.style.display='none';}
  D.full=st.x;D.shown=0;D.typing=true;D.autoT=0;$('dTx').textContent='';
}
function hideDialog(){show('dlg',false);show('dlgbar',false);}
function dlgAdvance(){
  if(GS.mode!=='dialog')return;
  if(D.typing){D.shown=D.full.length;D.typing=false;$('dTx').textContent=D.full;return;}
  SFX.ui();nextStep();
}
function dlgUpdate(dt){
  if(GS.mode!=='dialog')return;
  if(D.typing){
    const before=Math.floor(D.shown);D.shown+=dt*42;
    if(Math.floor(D.shown)!==before){SFX.text();}
    if(D.shown>=D.full.length){D.shown=D.full.length;D.typing=false;}
    $('dTx').textContent=D.full.slice(0,Math.floor(D.shown));
  }else if(D.auto){D.autoT+=dt;if(D.autoT>1.2+D.full.length*0.03)dlgAdvance();}
}
function skipToAction(){
  const list=SCRIPT[run.ch];
  while(run.i<list.length){const st=list[run.i];
    if(st.t==='bg'){GS.bg=st.bg;run.i++;continue;}
    if(st.t==='say'||st.t==='nar'||st.t==='sys'){run.i++;continue;}
    break;}
  nextStep();
}
$('dlg').addEventListener('click',()=>{audioInit();dlgAdvance();});
$('bSkip').addEventListener('click',e=>{e.stopPropagation();SFX.ui();skipToAction();});
$('bAuto').addEventListener('click',e=>{e.stopPropagation();D.auto=!D.auto;$('bAuto').classList.toggle('on',D.auto);});

function finish(){GS.mode='fin';GS.bg='title';hideDialog();show('fin',true);SFX.win();}

/* ---------------- title / chapter menu ---------------- */
$('verT').textContent='체험판 '+VERSION;$('verF').textContent=VERSION;
$('mNew').onclick=()=>{audioInit();SFX.ui();startChapter(0);};
$('mChap').onclick=()=>{audioInit();SFX.ui();buildChap();show('chap',true);};
$('chapBack').onclick=()=>{SFX.ui();show('chap',false);};
$('fTitle').onclick=()=>toTitle();
function buildChap(){
  const L=$('chapList');L.innerHTML='';
  CHAPTERS.forEach((c,i)=>{const b=document.createElement('button');b.className='btn';
    const lock=i>SAVE.unlocked;b.disabled=lock;
    b.innerHTML=`<span>${c.n} — ${c.t}</span><small>${lock?'🔒 이전 막을 끝내면 열려요':c.d}</small>`;
    b.onclick=()=>{SFX.ui();startChapter(i);};L.appendChild(b);});
}
function toTitle(){
  ['fin','pause','over','result','hud','ctrl','pauseB','chap','card'].forEach(i=>show(i,false));hideDialog();
  B=null;GS.mode='title';GS.bg='title';GS.paused=false;show('title',true);
}

/* ---------------- backgrounds ---------------- */
const BGP=[];for(let i=0;i<90;i++)BGP.push({x:Math.random(),y:Math.random(),s:Math.random(),v:rand(.2,1)});
function sgrad(c1,c2){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
function glow(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a==null?1:a;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}
function gateSky(x,y,s,t){
  ctx.save();ctx.translate(x,y);
  glow(0,0,s*1.6,'rgba(150,150,170,.35)');
  ctx.strokeStyle='rgba(210,210,230,.55)';ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<7;i++){const a=i/7*TAU+t*.05;ctx.moveTo(0,0);let px=0,py=0;for(let k=1;k<5;k++){px+=Math.cos(a+Math.sin(k*3+i)*.6)*s*.22;py+=Math.sin(a+Math.cos(k*2+i)*.6)*s*.12;ctx.lineTo(px,py);}}
  ctx.stroke();ctx.fillStyle='rgba(20,18,28,.9)';ctx.beginPath();ctx.ellipse(0,0,s*.32,s*.1,0,0,TAU);ctx.fill();
  ctx.restore();
}
function particles(col,dir,t,amt){
  ctx.fillStyle=col;
  for(let i=0;i<(amt||BGP.length);i++){const p=BGP[i];
    let y=(p.y+t*.03*p.v*dir)%1;if(y<0)y+=1;const x=(p.x+Math.sin(t*.3+i)*.01);
    ctx.globalAlpha=.25+.5*p.s;ctx.fillRect(x*W,y*H,1+p.s*2,1+p.s*2);}
  ctx.globalAlpha=1;
}
function skyline(base,col,seed,hmax,win){
  ctx.fillStyle=col;let x=0,i=0;
  while(x<W){const w=30+((seed*(i+3)*7919)%60);const h=hmax*(.35+(((seed+i)*4271)%100)/150);
    ctx.fillRect(x,base-h,w,h);
    if(win){ctx.fillStyle=win;for(let yy=base-h+8;yy<base-6;yy+=12)for(let xx=x+5;xx<x+w-6;xx+=10)if(((xx*31+yy*17+seed)%7)<2)ctx.fillRect(xx,yy,3,4);ctx.fillStyle=col;}
    x+=w+2;i++;}
}
function drawBg(key,t){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const m=Math.min(W,H);
  switch(key){
  case 'title':{
    sgrad('#0b0818','#020106');
    glow(W/2,H*.45,m*.8,'rgba(110,70,220,.35)');
    ctx.save();ctx.translate(W/2,H*.45);
    for(let i=0;i<5;i++){ctx.rotate(t*.05*(i%2?1:-1));ctx.strokeStyle=`rgba(${160+i*15},${120+i*20},255,${.12+.03*i})`;ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(0,0,m*(.25+i*.09),m*(.25+i*.09)*.92,0,0,TAU);ctx.stroke();}
    ctx.restore();particles('#b9a4ff',-1,t);break;}
  case 'tower':{
    sgrad('#120a24','#030208');glow(W/2,H*.42,m*.6,'rgba(140,60,255,.45)');
    ctx.strokeStyle='rgba(200,200,220,.35)';ctx.lineWidth=3;
    for(let i=0;i<9;i++){const a=i/9*TAU+Math.sin(t*.4+i)*.05;ctx.setLineDash([10,6]);ctx.beginPath();ctx.moveTo(W/2,H*.42);ctx.lineTo(W/2+Math.cos(a)*m,H*.42+Math.sin(a)*m);ctx.stroke();}
    ctx.setLineDash([]);
    ctx.fillStyle='#000';ctx.beginPath();ctx.arc(W/2,H*.42,m*.07+Math.sin(t*2)*3,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(180,120,255,.8)';ctx.lineWidth=2;ctx.stroke();
    particles('#c9b6ff',-1,t);break;}
  case 'forge':{
    sgrad('#2a2a33','#0f0c0b');gateSky(W*.72,H*.16,m*.5,t);
    ctx.fillStyle='#17110e';ctx.fillRect(0,H*.55,W,H*.45);
    glow(W*.2,H*.72,m*.45,'rgba(255,120,40,.45)',.7+Math.sin(t*5)*.08);
    ctx.fillStyle='#0b0807';ctx.fillRect(W*.42,H*.66,W*.16,H*.05);ctx.fillRect(W*.47,H*.71,W*.06,H*.1);ctx.fillRect(W*.43,H*.81,W*.14,H*.03);
    ctx.fillStyle='#1c1512';ctx.fillRect(0,H*.2,W*.06,H*.4);ctx.fillRect(W*.94,H*.2,W*.06,H*.4);
    particles('#bfbcc6',1,t);break;}
  case 'ark':case 'chamber':{
    sgrad(key==='ark'?'#06142a':'#020409','#010205');
    ctx.strokeStyle='rgba(60,170,255,.22)';ctx.lineWidth=1;
    const hz=H*.55;for(let i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(W/2+i*20,hz);ctx.lineTo(W/2+i*W*.18,H);ctx.stroke();}
    for(let k=0;k<10;k++){const y=hz+(H-hz)*Math.pow((k+(t*.4)%1)/10,2);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.globalAlpha=1;
    if(key==='ark'){
      ctx.fillStyle='#d8e6f5';ctx.fillRect(W*.47,H*.08,W*.06,hz-H*.08);glow(W*.5,H*.1,m*.25,'rgba(80,190,255,.6)',.6+Math.sin(t*3)*.3);
      ctx.fillStyle='#0b1a2e';ctx.beginPath();ctx.ellipse(W*.8,hz,W*.16,H*.2,0,PI,TAU);ctx.fill();
      ctx.fillStyle='#0b1a2e';ctx.fillRect(W*.06,hz-H*.16,W*.18,H*.16);glow(W*.15,hz-H*.05,m*.15,'rgba(255,140,60,.35)');
      for(let i=0;i<14;i++){const x=(i*137%100)/100*W,y=H*.2+((i*71+t*12)%(H*.3));ctx.strokeStyle='rgba(120,210,255,.5)';ctx.strokeRect(x,y,7,7);}
    }else{
      ctx.strokeStyle='rgba(80,200,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(W/2,H*.78,W*.32,H*.08,0,0,TAU);ctx.stroke();
      glow(W/2,H*.78,m*.4,'rgba(60,160,255,.25)');
    }
    particles('#7fd0ff',-1,t,40);break;}
  case 'plaza':{
    sgrad('#2a2347','#0d0b16');gateSky(W*.5,H*.12,m*.45,t);
    skyline(H*.66,'#141024',7,H*.38,'rgba(255,210,140,.75)');
    ctx.fillStyle='#1b1630';ctx.fillRect(0,H*.66,W,H*.34);
    for(let i=0;i<10;i++){const x=W*(i+.5)/10;ctx.fillStyle='#0c0a14';ctx.fillRect(x-1,H*.6,2,H*.08);glow(x,H*.6,22,'rgba(255,200,120,.8)');}
    for(let i=0;i<26;i++){const x=((i*97+t*(i%2?8:-6))%W+W)%W,y=H*.74+(i%4)*H*.05;ctx.fillStyle='#07060c';ctx.beginPath();ctx.arc(x,y,5,0,TAU);ctx.fill();ctx.fillRect(x-4,y+4,8,14);}
    break;}
  case 'unity':case 'alert':{
    sgrad('#2b1c12','#0e0906');
    ctx.fillStyle='#1d140d';ctx.fillRect(0,H*.6,W,H*.4);
    for(let i=0;i<5;i++){glow(W*(i+.5)/5,H*.12,m*.2,'rgba(255,190,110,.5)');}
    ctx.fillStyle='#100b07';for(let i=0;i<4;i++){ctx.fillRect(W*(.08+i*.24),H*.7,W*.16,H*.03);ctx.fillRect(W*(.1+i*.24),H*.73,W*.015,H*.08);ctx.fillRect(W*(.21+i*.24),H*.73,W*.015,H*.08);}
    ctx.fillStyle='#0a0e18';ctx.fillRect(W*.3,H*.18,W*.4,H*.26);ctx.strokeStyle='rgba(120,190,255,.5)';ctx.strokeRect(W*.3,H*.18,W*.4,H*.26);
    if(key==='alert'){const a=.25+.25*Math.sin(t*6);ctx.fillStyle=`rgba(255,30,40,${a})`;ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#ff4d5a';ctx.font=`800 ${Math.max(14,m*.05)}px sans-serif`;ctx.textAlign='center';ctx.fillText('⚠ WARNING — 제1 전초기지',W/2,H*.33);}
    break;}
  case 'outpost':{
    sgrad('#3a1a14','#0f0807');glow(W*.5,H*.3,m*.7,'rgba(255,90,40,.25)');
    ctx.strokeStyle='rgba(255,180,120,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(W/2,H*.85,m*.55,PI,TAU);ctx.stroke();
    ctx.fillStyle='#120b09';ctx.fillRect(0,H*.7,W,H*.3);
    for(let i=0;i<6;i++){ctx.fillStyle='#0b0706';ctx.fillRect(W*(.05+i*.17),H*.55,W*.05,H*.15);}
    particles('#ffb08a',-1,t,60);break;}
  case 'cliff':{
    sgrad('#1a0f2a','#05030a');glow(W*.75,H*.25,m*.4,'rgba(170,90,255,.3)');
    ctx.fillStyle='#07050c';ctx.beginPath();ctx.moveTo(W*.45,H);ctx.lineTo(W*.55,H*.55);ctx.lineTo(W,H*.5);ctx.lineTo(W,H);ctx.fill();
    for(const [x,s] of [[.68,1],[.78,1.25]]){ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(W*x,H*.47,8*s,22*s,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(W*x,H*.43-10*s,7*s,0,TAU);ctx.fill();
      ctx.fillStyle='#d08cff';ctx.fillRect(W*x-4*s,H*.43-12*s,3,2);ctx.fillRect(W*x+2*s,H*.43-12*s,3,2);}
    particles('#c9a4ff',1,t,50);break;}
  case 'moles':{
    sgrad('#1d2129','#08090c');
    ctx.fillStyle='#2a2f38';for(let i=0;i<8;i++)ctx.fillRect(W*i/8,0,4,H);
    ctx.fillStyle='#0d1016';ctx.beginPath();ctx.ellipse(W/2,H*.72,W*.33,H*.12,0,0,TAU);ctx.fill();
    glow(W/2,H*.7,m*.35,'rgba(90,180,255,.35)');ctx.strokeStyle='rgba(120,200,255,.6)';ctx.lineWidth=1;
    for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(W/2,H*.7,W*.05*(i+1),H*.02*(i+1),0,0,TAU);ctx.stroke();}
    break;}
  case 'waste':case 'phasis':{
    sgrad(key==='phasis'?'#2a0c3d':'#1a1226','#08060c');
    glow(W*.5,H*.3,m*(key==='phasis'?.75:.5),key==='phasis'?'rgba(200,90,255,.45)':'rgba(150,90,255,.3)');
    if(key==='phasis'){ctx.save();ctx.translate(W/2,H*.3);for(let i=0;i<6;i++){ctx.rotate(t*.3);ctx.strokeStyle=`rgba(220,160,255,${.15+i*.05})`;ctx.beginPath();ctx.ellipse(0,0,m*.12*(i+1),m*.04*(i+1),0,0,TAU);ctx.stroke();}ctx.restore();}
    else gateSky(W*.5,H*.28,m*.4,t);
    ctx.fillStyle='#0b0810';
    for(let i=0;i<9;i++){const x=W*(i/8),h=H*(.12+((i*37)%10)/50);ctx.beginPath();ctx.moveTo(x-W*.1,H*.75);ctx.lineTo(x,H*.75-h);ctx.lineTo(x+W*.1,H*.75);ctx.fill();}
    ctx.fillRect(0,H*.75,W,H*.25);
    if(key==='phasis'){for(let i=0;i<24;i++){const a=i/24*TAU+t*.2,r=m*(.2+.05*Math.sin(t+i));ctx.strokeStyle='rgba(230,200,255,.7)';ctx.beginPath();ctx.moveTo(W/2+Math.cos(a)*r,H*.3+Math.sin(a)*r*.5);ctx.lineTo(W/2+Math.cos(a)*(r+18),H*.3+Math.sin(a)*(r+18)*.5);ctx.stroke();}}
    particles('#d0a8ff',-1,t,70);break;}
  default:sgrad('#0b0818','#020106');
  }
}
