// Built-in keigo deck. Two item types share one SRS:
//  pair: {type:'pair', verb, meaning, kind:'S'|'K'|'T', keigo, reading, notes, sentence, translation}
//        S = 尊敬語 (honorific: raises the other person's actions)
//        K = 謙譲語 (humble I: lowers your own action toward someone you respect)
//        T = 丁重語 / 謙譲語II (humble II: lowers yourself/your side, just to be polite to the listener)
//  quiz: {type:'quiz', mode:'who'|'error'|'build', situation, sentence, answer, wrong:[3], why, prompt?}
//        The first entry is the right answer; the app shuffles the choices.
(function () {
  // [verb, meaning, kind, keigo, reading, notes, "sentence|translation"]
  const P = [
    // ---- core 尊敬語 ----
    ['行く・来る・いる', 'to go / come / be', 'S', 'いらっしゃる', 'いらっしゃる', 'Masu-form is いらっしゃいます (not いらっしゃります). Same irregular pattern as おっしゃる, なさる, くださる.', '先生は明日の会議にいらっしゃいますか。|Will you (teacher) come to tomorrow\'s meeting?'],
    ['食べる・飲む', 'to eat / drink', 'S', '召し上がる', 'めしあがる', 'Never use for your own eating (that is いただく). 召し上がられる is double keigo.', 'どうぞ、冷めないうちに召し上がってください。|Please eat before it gets cold.'],
    ['見る', 'to see / look', 'S', 'ご覧になる', 'ごらんになる', 'For the other person only. Your own looking is 拝見する.', '部長はもう資料をご覧になりましたか。|Has the manager already looked at the document?'],
    ['言う', 'to say', 'S', 'おっしゃる', 'おっしゃる', 'Masu-form: おっしゃいます. おっしゃられる is double keigo.', '社長がそうおっしゃいました。|The president said so.'],
    ['する', 'to do', 'S', 'なさる', 'なさる', 'Masu-form: なさいます. Also: ご説明なさる for する-verbs.', '先生は毎朝、散歩をなさいます。|The teacher takes a walk every morning.'],
    ['知っている', 'to know', 'S', 'ご存じだ', 'ごぞんじだ', 'Used as ご存じです / ご存じですか. Contrast with 存じ上げる (your own knowing a person).', 'その件はご存じですか。|Do you know about that matter?'],
    ['寝る', 'to sleep', 'S', 'お休みになる', 'おやすみになる', '', '社長はもうお休みになりました。|The president has already gone to bed.'],
    ['くれる', 'to give (to me)', 'S', 'くださる', 'くださる', 'Masu-form: くださいます. The giver is above you.', '先生が本をくださいました。|The teacher gave me a book.'],
    ['書く', 'to write', 'S', 'お書きになる', 'おかきになる', 'お + V-stem + になる. Works for most verbs; not for one-syllable stems like 見る, 着る, いる.', '先生がこの本をお書きになりました。|The teacher wrote this book.'],
    ['読む', 'to read', 'S', 'お読みになる', 'およみになる', '', '部長は新聞をお読みになっています。|The manager is reading the newspaper.'],
    ['作る', 'to make', 'S', 'お作りになる', 'おつくりになる', '', 'これは社長がお作りになった料理です。|This is a dish the president made.'],
    ['聞く', 'to listen / ask', 'S', 'お聞きになる', 'おききになる', '', '先生はその話をお聞きになりましたか。|Did the teacher hear that story?'],
    ['Vている', 'to be doing', 'S', 'Vていらっしゃる', '〜ていらっしゃる', 'いらっしゃる attached to the て-form.', '先生は今、お客様と話していらっしゃいます。|The teacher is talking with a guest now.'],
    ['です', 'to be', 'S', 'でいらっしゃる', 'でいらっしゃる', 'Used about the other person (お客様は学生でいらっしゃいます). Not でございます, which is humble II.', 'こちらの方が山田様でいらっしゃいますか。|Is this person Mr. Yamada?'],
    ['着る', 'to wear', 'S', 'お召しになる', 'おめしになる', 'お召し物 = clothes. One-syllable stem, so お着きになる is wrong.', 'お客様はとても素敵なコートをお召しになっていました。|The customer was wearing a lovely coat.'],
    ['Vてくれる', 'to do for me', 'S', 'Vてくださる', '〜てくださる', 'The doer is above you.', '先生が日本語を教えてくださいました。|The teacher taught me Japanese.'],
    ['Vる (generic)', 'to do (regular verbs)', 'S', 'お/ご + V + になる', 'お〜になる／ご〜になる', 'お + native verb stem (お書きになる). ご + する-noun (ご利用になる). Do not add られる on top.', 'どうぞ、ご利用になってください。|Please feel free to use it.'],
    ['Vてください', 'please do', 'S', 'お/ご + V + ください', 'お〜ください／ご〜ください', 'The polite request form: お待ちください, ご確認ください. With お〜になって, it sounds heavier.', '少々お待ちください。|Please wait a moment.'],
    ['Vる (generic)', 'honorific passive', 'S', 'V + れる／られる', '〜れる／〜られる', 'Lowest-level honorific; same form as passive and potential. Context decides. 来る→来られる, する→される.', '社長は九時に来られます。|The president will come at nine.'],
    ['来る', 'to come', 'S', 'お見えになる', 'おみえになる', 'Formal / business register. Often for visitors arriving.', 'お客様がお見えになりました。|The guest has arrived.'],
    ['来る', 'to come', 'S', 'お越しになる', 'おこしになる', 'Formal / business register. Also お越しください (please come).', '明日はどなたがお越しになりますか。|Who will come tomorrow?'],
    ['行く・来る・いる', 'to go / come / be', 'S', 'おいでになる', 'おいでになる', 'Formal / business register. Slightly older sounding than いらっしゃる.', '部長はまもなくおいでになります。|The manager will be here shortly.'],
    ['Vている', 'to be doing', 'S', 'Vておいでになる', '〜ておいでになる', 'Formal / business register.', '先生は今、研究をしておいでになります。|The professor is doing research now.'],

    // ---- core 謙譲語 / 丁重語 ----
    ['行く・来る', 'to go / come (humble II)', 'T', '参る', 'まいる', '謙譲語II (丁重語). Polite to the listener, not toward a recipient. 参ります. Never about the customer.', 'すぐに参りますので、少々お待ちください。|I will be right there, so please wait a moment.'],
    ['いる', 'to be', 'T', 'おる', 'おる', '謙譲語II. Masu-form おります. Use for you or your side (社内の人) when speaking to an outsider.', '田中は席を外しております。|Tanaka is away from his desk.'],
    ['ある', 'to exist / there is', 'T', 'ございます', 'ございます', '丁重語 / 丁寧語. NOT honorific: it cannot be used to raise the other person. (でいらっしゃる is the honorific の です.)', '資料はこちらにございます。|The documents are here.'],
    ['です', 'to be', 'T', 'でございます', 'でございます', 'Humble II / very polite. Fine for things (こちらがメニューでございます); for people use でいらっしゃる.', 'こちらがご注文の品でございます。|This is the item you ordered.'],
    ['言う', 'to say', 'T', '申す', 'もうす', '謙譲語II. 申します / 申しております. Self-introduction: 田中と申します.', '田中と申します。|My name is Tanaka.'],
    ['言う', 'to say (to a respected person)', 'K', '申し上げる', 'もうしあげる', '謙譲語I. Directed toward someone you respect: お礼を申し上げます.', '心よりお礼を申し上げます。|I sincerely express my thanks.'],
    ['聞く', 'to ask / hear (to visit)', 'K', '伺う', 'うかがう', 'Humble for asking and for visiting a person or place. 伺います.', '明日の午後、御社に伺います。|I will visit your company tomorrow afternoon.'],
    ['訪ねる・尋ねる', 'to visit / ask', 'K', '伺う', 'うかがう', 'Same form as 聞く. 伺う is also what you use to ask a question of someone.', '先生にお話を伺いました。|I heard (asked) the story from the teacher.'],
    ['会う', 'to meet', 'K', 'お目にかかる', 'おめにかかる', 'お目にかかります / お目にかかれて光栄です.', 'お目にかかれて光栄です。|It is an honor to meet you.'],
    ['見る', 'to see / look', 'K', '拝見する', 'はいけんする', 'For you looking at the other person\'s things. 拝見します.', '送っていただいた資料を拝見しました。|I have looked at the document you sent.'],
    ['食べる・飲む・もらう', 'to eat / drink / receive', 'K', 'いただく', 'いただく', 'いただきます. For receiving from a superior: 社長からいただきました. Never raises the other person.', 'お言葉に甘えて、いただきます。|Then I\'ll gladly accept.'],
    ['する', 'to do', 'T', 'いたす', 'いたす', '謙譲語II. いたします. Also ご連絡いたします. Not for the other person\'s actions.', '明日またご連絡いたします。|I will contact you again tomorrow.'],
    ['あげる', 'to give', 'K', '差し上げる', 'さしあげる', 'Giver = you, receiver = someone above you.', '先生にお土産を差し上げました。|I gave the teacher a souvenir.'],
    ['知っている・思う', 'to know / think', 'T', '存じる', 'ぞんじる', '存じております / 存じます. For things and facts. 存じません (not 存じ上げません) for a matter.', 'その件は存じております。|I am aware of that matter.'],
    ['知る', 'to know (a person)', 'K', '存じ上げる', 'ぞんじあげる', 'Used for knowing a person: 山田様は存じ上げております. For facts use 存じる.', '山田様は存じ上げております。|I know Mr. Yamada (by reputation or acquaintance).'],
    ['書く', 'to write', 'K', 'お書きする', 'おかきする', 'お + V-stem + する. For your action that benefits someone: お書きします.', '住所はこちらにお書きします。|I will write the address here for you.'],
    ['読む', 'to read', 'K', 'お読みする', 'およみする', '', '手紙を先生にお読みしました。|I read the letter to the teacher.'],
    ['作る', 'to make', 'K', 'お作りする', 'おつくりする', '', 'お客様のためにお作りします。|I will make it for you.'],
    ['Vている', 'to be doing', 'T', 'Vておる', '〜ておる', 'Almost always used as 〜ております.', '現在、準備を進めております。|We are currently making preparations.'],
    ['借りる', 'to borrow', 'K', '拝借する', 'はいしゃくする', 'Formal / business register. 拝借します.', 'ペンを拝借してもよろしいでしょうか。|May I borrow your pen?'],
    ['見せる', 'to show', 'K', 'ご覧に入れる', 'ごらんにいれる', 'Formal / business register. Also お目にかける.', '新しい製品をご覧に入れます。|I will show you our new product.'],
    ['聞く・引き受ける', 'to hear / accept', 'K', '承る', 'うけたまわる', 'Formal / business register. ご注文を承ります (take an order).', 'ご注文を承ります。|I will take your order.'],
    ['伝言する', 'to convey a message', 'K', '申し伝える', 'もうしつたえる', 'Formal / business register.', '部長に申し伝えます。|I will pass it on to the manager.'],
    ['Vていく・Vてくる', 'to go / come (-te form)', 'T', 'Vてまいる', '〜てまいる', 'Formal / business register. 〜てまいります.', '今後も努力してまいります。|We will continue to make an effort.'],
    ['もらう', 'to receive', 'K', '頂戴する', 'ちょうだいする', 'Even more formal than いただく. Also used for 食べる／飲む in business: 頂戴します.', 'お電話を頂戴し、ありがとうございます。|Thank you for your call.'],
    ['Vてもらう', 'to have someone do', 'K', 'Vていただく', '〜ていただく', 'The doer is above you. Contrast with 〜てくださる (what the doer did for you).', '先生に論文を見ていただきました。|I had the teacher look at my paper.'],
    ['Vてあげる', 'to do for someone', 'K', 'V て差し上げる', '〜て差し上げる', 'Rarely said to the person directly; sounds like you\'re doing them a favor. Prefer お〜する.', '先生の荷物を持って差し上げました。|I carried the teacher\'s luggage for them.'],
    ['Vる (generic)', 'humble (regular verbs)', 'K', 'お/ご + V + する／いたす', 'お〜する／ご〜する', 'お + native verb, ご + する-noun: お持ちする, ご案内する. Raise: いたす (お持ちいたします).', 'お荷物をお持ちします。|I will carry your luggage.'],
    ['わかる', 'to understand / OK', 'K', 'かしこまる', 'かしこまる', 'かしこまりました. 承知いたしました is the written/business equivalent.', 'かしこまりました。少々お待ちください。|Certainly. Please wait a moment.'],
    ['読む・聞く', 'to read / listen (humble)', 'K', '拝読する／拝聴する', 'はいどくする／はいちょうする', 'Used for texts and speeches of someone you respect.', '先生のご講演を拝聴しました。|I listened to your lecture.'],
  ];

  // Quiz entries: [mode, situation, sentence, answer, [w1, w2, w3], why]
  const Q = [
    // ---- who is acting? (choose the form) ----
    ['who', 'You are shop staff speaking to a customer who is about to eat.', 'どうぞ、冷めないうちに＿＿。', '召し上がってください', ['いただいてください', 'お食べしてください', '拝見してください'], 'The customer is the one eating, so use 尊敬語. いただく is humble and would lower the customer.'],
    ['who', 'You are at lunch with a client and say what you will order.', 'では、私もご一緒に＿＿。', 'いただきます', ['召し上がります', 'お食べになります', '食べられます'], 'You are the actor, so humble (謙譲語). Never use 召し上がる for yourself.'],
    ['who', 'You are talking to your teacher about a meeting.', '先生は明日の会議に＿＿か。', 'いらっしゃいます', ['参ります', '伺います', 'おります'], 'The teacher is the one coming, so 尊敬語. 参る, 伺う and おる lower the speaker.'],
    ['who', 'You are telling a client you will go to their office.', '明日の午後、御社に＿＿。', '伺います', ['いらっしゃいます', 'お越しになります', 'おいでになります'], 'You are the one visiting, and the place belongs to someone you respect, so 伺う (謙譲語).'],
    ['who', 'You introduce yourself to a new client.', 'はじめまして、ABC商事の田中と＿＿。', '申します', ['おっしゃいます', '言われます', '申されます'], 'You are the speaker, so 申す (謙譲語II). おっしゃる and 言われる raise the subject. 申される is wrong.'],
    ['who', 'You are asking a client about what their president said.', '社長がそのように＿＿か。', 'おっしゃいました', ['申しました', '申し上げました', 'お言いになりました'], 'The president is the speaker here, so 尊敬語 おっしゃる. お言いになる is not used for 言う.'],
    ['who', 'A client phones. You answer about your own section chief.', '申し訳ございません、課長は今外出して＿＿。', 'おります', ['いらっしゃいます', 'おいでです', 'ございます'], 'To outsiders, you lower your own side (内と外): your chief becomes おる, not いらっしゃる.'],
    ['who', 'You tell your own boss that a client is waiting.', 'お客様がロビーに＿＿。', 'いらっしゃいます', ['おります', '参ります', 'ございます'], 'The client is above you and your boss. 尊敬語 いらっしゃる. おる would lower the client.'],
    ['who', 'A client sent you a document. You report back.', 'お送りいただいた資料を＿＿しました。', '拝見', ['ご覧', 'お見に', '見られ'], 'You looked at the client\'s document: humble 拝見する. ご覧になる is for the other person\'s looking.'],
    ['who', 'You are handing a customer a brochure.', 'こちらの資料を＿＿ください。', 'ご覧になって', ['拝見して', 'ご覧して', 'お見せして'], 'The customer is the one looking, so ご覧になる. 拝見 is humble and ご覧して is not a form.'],
    ['who', 'You are asking whether a manager knows about an issue.', '部長はもうその件を＿＿ですか。', 'ご存じ', ['存じ', '存じ上げ', 'お知りに'], 'The manager is the knower, so ご存じ (尊敬語). 存じる is for your own knowing.'],
    ['who', 'A client asks if you are aware of a problem.', 'その件でしたら、私も＿＿おります。', '存じて', ['ご存じで', '知っていらして', 'おいでで'], 'You are the knower, so humble 存じる. ご存じ would raise yourself.'],
    ['who', 'You are describing what a teacher did for you.', '先生が私にこの本を＿＿。', 'くださいました', ['くれられました', 'あげました', '差し上げました'], 'The teacher is the giver and is above you, so くださる. 差し上げる is for you giving.'],
    ['who', 'You are describing a gift you gave to your teacher.', '私は先生にこの本を＿＿。', '差し上げました', ['くださいました', 'いただきました', 'あげられました'], 'You are the giver and the teacher is above you, so 差し上げる (humble).'],
    ['who', 'You are describing a gift from the president.', '社長から旅行のお土産を＿＿。', 'いただきました', ['くださいました', '差し上げました', 'もらわれました'], 'You received it. いただく is the humble verb for もらう. くださった would need 社長が as the subject.'],
    ['who', 'You are asking a customer for their name.', 'お名前を＿＿てもよろしいでしょうか。', '伺っ', ['聞かれ', 'お聞きになっ', 'おっしゃっ'], 'You are the one asking, so 伺う. Honorifics (お聞きになる, おっしゃる) would raise you.'],
    ['who', 'You close a business email to a client.', 'ご連絡を＿＿ております。', 'お待ちし', ['お待ちになっ', 'お待ちされ', '待たれ'], 'You are waiting for their contact, so humble お待ちする. お待ちになる is honorific.'],
    ['who', 'You ask a customer to hold on.', '少々＿＿。', 'お待ちください', ['お待ちしてください', '待ってあげてください', 'お待ちになられてください'], 'The standard request form is お + V + ください. お待ちして… mixes humble with a request. ...になられて is double keigo.'],
    ['who', 'You say to a customer who is calling for your colleague.', '明日、＿＿の山田が参ります。', '弊社', ['御社', '貴社', 'お宅'], '弊社 is humble for your own company. 御社 / 貴社 refer to the other party\'s company.'],
    ['who', 'You serve a customer at a café.', 'こちらがご注文のコーヒーで＿＿。', 'ございます', ['いらっしゃいます', 'おります', 'あられます'], 'で + ございます is the polite equivalent of です for things. いらっしゃいます is for people.'],
    ['who', 'You ask a customer about their occupation.', 'お客様は学生で＿＿か。', 'いらっしゃいます', ['ございます', 'おります', 'あります'], 'The customer is the subject, so でいらっしゃる. でございます is used for things, not for the customer.'],
    ['who', 'A client asks when the representative will arrive.', 'ただいま担当の者が＿＿ますので、少々お待ちください。', '参り', ['いらっしゃい', 'おいでに', 'お越しに'], 'Your own staff are arriving, so 参る (謙譲語II). The others would raise them in front of an outsider.'],
    ['who', 'You are talking to your teacher about the document they asked you to look at.', '先生にいただいた資料を＿＿ました。', '拝見し', ['ご覧になり', 'ご覧に入れ', '見られ'], 'You looked at it, so 拝見する. ご覧に入れる means to show.'],
    ['who', 'You say what you will do for a client.', '明日までに資料を＿＿。', 'お送りします', ['お送りになります', '送られます', 'お送りしてくださいます'], 'You are the one sending, so お〜します (謙譲語). お〜になる would raise you.'],
    ['who', 'You are at the reception desk, guiding a client.', 'お客様、こちらへ＿＿。', 'どうぞお越しください', ['どうぞ参ります', 'どうぞ伺ってください', 'どうぞ来てあげてください'], 'You are inviting the client to come, so 尊敬語 お越しください.'],
    ['who', 'You are on the phone and refer to a customer from another company.', '山田様は先ほど＿＿ました。', 'お帰りになり', ['お帰りし', '帰り申し', '帰らせていただき'], 'Yamada-sama is the subject and is not on your side, so お帰りになる.'],

    // ---- error spotter ----
    ['error', 'You are speaking to a customer (outsider).', 'お客様が参りました。', 'お客様がいらっしゃいました。', ['お客様が伺いました。', 'お客様がおりました。', 'お客様が申しました。'], '参る is humble and lowers the customer. Use いらっしゃる (or お見えになる).'],
    ['error', 'You are speaking to your client about a document you read.', '私が資料をご覧になりました。', '私が資料を拝見しました。', ['私が資料をご覧しました。', '私が資料を拝見になりました。', '私が資料をお見えしました。'], 'ご覧になる raises the subject, which is you. Your own looking is 拝見する.'],
    ['error', 'You are speaking about the president.', '社長がおっしゃられました。', '社長がおっしゃいました。', ['社長が申されました。', '社長が申し上げました。', '社長がおっしゃれました。'], 'おっしゃる is already honorific; adding られる makes a double honorific (二重敬語).'],
    ['error', 'You are speaking to a customer who is eating.', 'お客様が召し上がられました。', 'お客様が召し上がりました。', ['お客様がいただきました。', 'お客様がお召し上がりしました。', 'お客様がお食べになられました。'], '召し上がる is already honorific; 召し上がられる is a double honorific.'],
    ['error', 'You are asking a customer to wait.', 'こちらでお待ちしてください。', 'こちらでお待ちください。', ['こちらでお待ちにしてください。', 'こちらでお待ちしてさしあげてください。', 'こちらで待たさせてください。'], 'お待ちする is humble. A request to the customer uses お待ちください.'],
    ['error', 'You are speaking to a visitor about your own boss.', '課長は席にいらっしゃいません。', '課長は席におりません。', ['課長は席におられません。', '課長は席にございません。', '課長は席にいませんでございます。'], 'When talking to outsiders, lower your own side: いらっしゃる becomes おる.'],
    ['error', 'A client asks whether you know a certain matter.', 'その件は存じ上げません。', 'その件は存じません。', ['その件はご存じです。', 'その件は存じ上げます。', 'その件はお知りしません。'], '存じ上げる is for people. For a matter, use 存じる: 存じません / 存じておりません.'],
    ['error', 'You are asking a customer to fill in a form.', 'こちらにご記入してください。', 'こちらにご記入ください。', ['こちらにご記入しましょう。', 'こちらにご記入いたしてください。', 'こちらに記入してあげてください。'], 'ご〜する is humble. A request to the customer is ご記入ください.'],
    ['error', 'You ask whether a customer has left.', 'お客様はもうお帰りになられましたか。', 'お客様はもうお帰りになりましたか。', ['お客様はもうお帰りしましたか。', 'お客様はもう帰られになりましたか。', 'お客様はもうお帰りされましたか。'], 'お〜になる plus れる/られる is a double honorific. Use one honorific only.'],
    ['error', 'You tell your boss what you will do.', '私が部長にご説明されます。', '私が部長にご説明いたします。', ['私が部長にご説明になります。', '私が部長にご説明くださいます。', '私が部長に説明されます。'], 'される is honorific and raises you. The speaker uses humble ご説明する／ご説明いたす.'],
    ['error', 'You are offering to guide your teacher.', '私が先生を駅までご案内になります。', '私が先生を駅までご案内します。', ['私が先生を駅までご案内なさいます。', '私が先生を駅までご案内くださいます。', '私が先生を駅まで案内されます。'], 'ご〜になる raises the subject (you). Your own action should be ご〜する／いたす.'],
    ['error', 'You are speaking to a customer.', '資料を拝見になってください。', '資料をご覧ください。', ['資料を拝見してください。', '資料を拝見なさってください。', '資料を見てさしあげてください。'], '拝見 is humble, so it cannot be used for the customer\'s action. Use ご覧ください.'],
    ['error', 'You are speaking to a customer who is eating.', 'どうぞ、いただいてください。', 'どうぞ、召し上がってください。', ['どうぞ、召し上がりしてください。', 'どうぞ、お召し上がりしてください。', 'どうぞ、食べさせていただいてください。'], 'いただく is humble and lowers the customer. Use 召し上がる.'],
    ['error', 'You are speaking to an outside client about your company.', '弊社の社長がいらっしゃいます。', '弊社の社長が参ります。', ['弊社の社長がおいでになります。', '弊社の社長がお越しになります。', '弊社の社長がお見えになります。'], 'Your own president is on your side, so no honorifics for outsiders. Use 参る.'],
    ['error', 'You are speaking to a customer.', 'お客様が参られました。', 'お客様がお見えになりました。', ['お客様がいらっしゃられました。', 'お客様が参りになりました。', 'お客様が伺われました。'], '参る is humble and 参られる is not a valid honorific. Use お見えになる or いらっしゃる.'],
    ['error', 'You are speaking to a customer who is leaving.', 'また明日、伺ってください。', 'また明日、お越しください。', ['また明日、参ってください。', 'また明日、お伺いしてください。', 'また明日、お越ししてください。'], '伺う is humble and cannot be used for the customer\'s action. Use お越しください.'],
    ['error', 'You are offering to carry something for your senior.', '私が先輩のカバンをお持ちになります。', '私が先輩のカバンをお持ちします。', ['私が先輩のカバンをお持ちくださいます。', '私が先輩のカバンをお持ちされます。', '私が先輩のカバンを持ってくださいます。'], 'お〜になる raises the subject (you). For your own action, お〜する.'],
    ['error', 'You tell a client you know a person.', '山田様のことはよくご存じ上げております。', '山田様のことはよく存じ上げております。', ['山田様のことはよくご存じでおります。', '山田様のことはよく存じられております。', '山田様のことはよくご存じしております。'], 'ご存じ is the honorific form. For yourself, use 存じ上げる.'],

    // ---- pattern builder ----
    ['build', 'Make the honorific (尊敬語) form: 部長が新聞を読む。', '部長が新聞を＿＿。', 'お読みになる', ['お読みする', '読みになる', 'ご読みになる'], 'お + V-stem + になる.'],
    ['build', 'Make the humble (謙譲語) form: 私が荷物を持つ。', '私が荷物を＿＿。', 'お持ちする', ['お持ちになる', 'ご持ちする', 'お持ちくださる'], 'お + V-stem + する.'],
    ['build', 'Make the honorific form: 先生が論文を書く。', '先生が論文を＿＿。', 'お書きになる', ['お書きする', 'ご書きになる', 'お書きになられる'], 'お + V-stem + になる. Do not add られる.'],
    ['build', 'Make the humble form: 私が資料を送る。', '私が資料を＿＿。', 'お送りする', ['お送りになる', 'ご送りする', '送られる'], 'お + V-stem + する.'],
    ['build', 'Make the honorific form: お客様が利用する。', 'お客様が＿＿。', 'ご利用になる', ['お利用になる', 'ご利用する', 'お利用する'], 'する-nouns of Chinese origin usually take ご: ご + noun + になる.'],
    ['build', 'Make the humble form: 私が説明する。', '私が＿＿。', 'ご説明する', ['ご説明になる', 'お説明する', 'ご説明なさる'], 'ご + noun + する (or ご説明いたす).'],
    ['build', 'Make the request form: ここで待ってください。', 'こちらで＿＿。', 'お待ちください', ['お待ちしてください', '待ちになってください', 'お待ちにしてください'], 'お + V-stem + ください.'],
    ['build', 'Humble form: 先生に教えてもらった。', '先生に＿＿。', '教えていただいた', ['教えてくださった', '教えて差し上げた', 'お教えになった'], 'The teacher did something for you: 〜ていただく (you receive).'],
    ['build', 'Honorific form: 先生が教えてくれた。', '先生が＿＿。', '教えてくださった', ['教えていただいた', '教えて差し上げた', '教えてあげられた'], 'The teacher is the doer: 〜てくださる.'],
    ['build', 'Humble form: 私が先生の荷物を持ってあげた。', '私が先生の荷物を＿＿。', '持って差し上げた', ['持ってくださった', '持っていただいた', 'お持ちになった'], 'You are the doer, so 〜て差し上げる.'],
    ['build', 'Honorific form: 先生は今、授業をしている。', '先生は今、授業を＿＿。', 'していらっしゃる', ['しておる', 'していただいている', 'しいらっしゃる'], 'V-て + いらっしゃる.'],
    ['build', 'Humble form: 私は今、資料を作っている。', '私は今、資料を＿＿。', '作っております', ['作っていらっしゃいます', 'お作りになっています', '作っておられます'], 'V-て + おる (humble II).'],
    ['build', 'Honorific: 社長が来る (casual honorific with れる/られる)。', '社長が＿＿。', '来られる', ['来れる', '来さられる', '来させる'], 'れる/られる for 来る is 来られる. Not 来れる (casual potential).'],
    ['build', 'Humble form: 私は昼食を食べる。', '私は昼食を＿＿。', 'いただく', ['召し上がる', 'お食べになる', 'お食べする'], '食べる has a special humble verb: いただく.'],
    ['build', 'Humble form: 私は山田と言う。', '私は山田と＿＿。', '申す', ['おっしゃる', '言われる', '言い申す'], '言う has a special humble verb: 申す.'],
    ['build', 'Humble form: 私が写真を見せる。', '私が写真を＿＿。', 'お見せする', ['お見せになる', 'ご覧になる', '拝見する'], 'お + V-stem + する. (ご覧に入れる / お目にかける are also possible.)'],
    ['build', 'Humble form: 私が先生に質問を聞く (ask).', '私が先生に質問を＿＿。', '伺う', ['お聞きになる', 'おっしゃる', '存じる'], '聞く (to ask a person) has a special humble verb: 伺う.'],
    ['build', 'Humble form: 私が社長に会う。', '私が社長に＿＿。', 'お目にかかる', ['お会いになる', '会われる', '拝見する'], '会う has a special humble verb: お目にかかる.'],
  ];

  const items = [];
  P.forEach((r, i) => {
    const s = (r[6] || '').split('|');
    items.push({ id: 'p' + String(i + 1).padStart(2, '0'), type: 'pair', verb: r[0], meaning: r[1], kind: r[2], keigo: r[3], reading: r[4], notes: r[5], sentence: s[0] || '', translation: s[1] || '' });
  });
  const counters = { who: 0, error: 0, build: 0 }, letter = { who: 'w', error: 'e', build: 'b' };
  const quizzes = Q.map(r => {
    counters[r[0]]++;
    return { id: letter[r[0]] + String(counters[r[0]]).padStart(2, '0'), type: 'quiz', mode: r[0], situation: r[1], sentence: r[2], answer: r[3], wrong: r[4], why: r[5] };
  });

  // Order: the first 20 core pairs, then alternate pairs and scenario questions (mixed modes).
  const out = items.slice(0, 20);
  const restP = items.slice(20);
  const byMode = ['who', 'error', 'build'].map(m => quizzes.filter(q => q.mode === m));
  const mixed = [];
  for (let i = 0; mixed.length < quizzes.length; i++) byMode.forEach(l => { if (l[i]) mixed.push(l[i]); });
  const rest = [];
  let a = 0, b = 0;
  while (a < restP.length || b < mixed.length) {
    if (a < restP.length) rest.push(restP[a++]);
    if (b < mixed.length) rest.push(mixed[b++]);
    if (b < mixed.length) rest.push(mixed[b++]);
  }
  window.SEED_KEIGO = out.concat(rest);
})();
