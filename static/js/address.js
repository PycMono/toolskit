/* ============================================
   Tool Box Nova - Virtual Address Generator JS
   Pure frontend, no server required
   ============================================ */

// ---- Data Sets ----
const DATA = {
  US: {
    firstMale: ['James','John','Robert','Michael','William','David','Richard','Joseph','Charles','Thomas','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Kenneth'],
    firstFemale: ['Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen','Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna'],
    last: ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Anderson','Taylor','Thomas','Moore','Jackson','Martin','Lee','Thompson','White','Harris','Clark'],
    streets: ['Main St','Oak Ave','Maple Dr','Cedar Ln','Pine Rd','Elm St','Washington Blvd','Lake Dr','Hill Rd','River Rd','Park Ave','Broadway','1st Ave','2nd St','3rd St'],
    cities: ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte'],
    states: ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa'],
    stateAbbr: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA'],
    phone: '+1',
    currency: 'USD',
    tld: '.com',
    timezone: 'America/New_York',
    flag: '🇺🇸',
    name: 'United States',
  },
  GB: {
    firstMale: ['Oliver','Jack','Harry','George','Charlie','Jacob','Alfie','Freddie','Oscar','Archie','Arthur','Leo','Noah','Thomas','Henry','Edward','Theo','Ethan','James','Luca'],
    firstFemale: ['Olivia','Amelia','Isla','Ava','Emily','Isabella','Mia','Poppy','Ella','Lily','Grace','Sophia','Freya','Evie','Scarlett','Chloe','Phoebe','Sienna','Jessica','Lucy'],
    last: ['Smith','Jones','Williams','Taylor','Brown','Davies','Evans','Wilson','Thomas','Roberts','Johnson','Lewis','Walker','Robinson','Wood','Thompson','White','Watson','Jackson','Wright'],
    streets: ['High Street','Church Lane','Victoria Road','Station Road','Green Lane','Manor Road','Park Road','Mill Lane','School Lane','The Avenue','Kings Road','Queens Road','Castle Street','Bridge Street','North Street'],
    cities: ['London','Birmingham','Leeds','Glasgow','Sheffield','Bradford','Edinburgh','Liverpool','Manchester','Bristol','Wakefield','Cardiff','Coventry','Nottingham','Leicester'],
    states: ['England','Scotland','Wales','Northern Ireland'],
    stateAbbr: ['ENG','SCT','WLS','NIR'],
    phone: '+44',
    currency: 'GBP',
    tld: '.co.uk',
    timezone: 'Europe/London',
    flag: '🇬🇧',
    name: 'United Kingdom',
  },
  DE: {
    firstMale: ['Ben','Paul','Jonas','Felix','Noah','Leon','Elias','Lukas','Julian','Finn','Max','Moritz','Henrik','Lars','Tobias','Simon','Philipp','Alexander','Sebastian','Maximilian'],
    firstFemale: ['Emma','Mia','Hannah','Lena','Anna','Sophie','Julia','Laura','Lea','Clara','Marie','Sarah','Lara','Nina','Katharina','Leonie','Amelie','Lisa','Charlotte','Johanna'],
    last: ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Koch','Bauer','Richter','Klein','Wolf','Schröder','Neumann','Schwarz','Zimmermann','Braun'],
    streets: ['Hauptstraße','Kirchgasse','Bahnhofstraße','Gartenweg','Lindenallee','Schillerstraße','Goethestraße','Bergstraße','Waldweg','Schulstraße'],
    cities: ['Berlin','Hamburg','Munich','Cologne','Frankfurt','Stuttgart','Düsseldorf','Dortmund','Essen','Leipzig','Bremen','Dresden','Hanover','Nuremberg','Duisburg'],
    states: ['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen'],
    stateAbbr: ['BW','BY','BE','BB','HB','HH','HE','MV','NI','NW'],
    phone: '+49',
    currency: 'EUR',
    tld: '.de',
    timezone: 'Europe/Berlin',
    flag: '🇩🇪',
    name: 'Germany',
  },
  CN: {
    firstMale: ['伟','芳','娜','秀英','敏','静','丽','强','磊','洋','艳','勇','军','杰','娟'],
    firstFemale: ['芳','娜','秀英','敏','静','丽','艳','娟','霞','英'],
    last: ['王','李','张','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗'],
    streets: ['人民路','解放路','中山路','建国路','南京路','北京路','幸福路','和平路','光明路','新华路'],
    cities: ['北京','上海','广州','深圳','成都','杭州','武汉','西安','南京','郑州','天津','苏州','重庆','长沙','沈阳'],
    states: ['北京','上海','广东','四川','浙江','湖北','陕西','江苏','河南','天津'],
    stateAbbr: ['BJ','SH','GD','SC','ZJ','HB','SN','JS','HA','TJ'],
    phone: '+86',
    currency: 'CNY',
    tld: '.cn',
    timezone: 'Asia/Shanghai',
    flag: '🇨🇳',
    name: 'China',
  },
  JP: {
    firstMale: ['太郎','一郎','健太','翔太','大輔','拓也','隆','誠','勇','洋','修','博','浩','章','明'],
    firstFemale: ['花子','美咲','結衣','陽菜','さくら','愛','美香','由美','恵子','裕子','真由美','智子','直子','里奈','麻衣'],
    last: ['佐藤','鈴木','高橋','田中','伊藤','渡辺','山本','中村','小林','加藤','吉田','山田','佐々木','山口','松本','井上','木村','林','清水','山崎'],
    streets: ['中央通り','本町','駅前通り','桜通り','大通り','栄町','緑町','新町','幸町','平和通り','銀座通り','昭和通り','大手町','丸の内','青山'],
    cities: ['東京','大阪','横浜','名古屋','札幌','神戸','京都','福岡','川崎','さいたま','広島','仙台','北九州','千葉','世田谷'],
    states: ['東京都','大阪府','神奈川県','愛知県','北海道','兵庫県','京都府','福岡県','埼玉県','千葉県','広島県','宮城県','新潟県','静岡県','長野県'],
    stateAbbr: ['東京','大阪','神奈川','愛知','北海道','兵庫','京都','福岡','埼玉','千葉','広島','宮城','新潟','静岡','長野'],
    phone: '+81',
    currency: 'JPY',
    tld: '.jp',
    timezone: 'Asia/Tokyo',
    flag: '🇯🇵',
    name: 'Japan',
  },
  KR: {
    firstMale: ['민준','서준','예준','도윤','시우','주원','하준','지호','준서','우진','현우','건우','선우','연우','유준'],
    firstFemale: ['서연','지우','서현','민서','하은','지아','수아','채원','지민','수빈','윤서','예은','다은','은서','가은'],
    last: ['김','이','박','최','정','강','조','윤','장','임','한','신','오','서','권','황','안','송','홍','전'],
    streets: ['강남대로','테헤란로','세종대로','종로','을지로','남대문로','삼성로','압구정로','신사동','논현동','역삼동','대치동','서초동','반포동','청담동'],
    cities: ['서울','부산','인천','대구','대전','광주','울산','수원','창원','고양','용인','성남','청주','부천','안산'],
    states: ['서울특별시','부산광역시','인천광역시','대구광역시','대전광역시','광주광역시','울산광역시','경기도','강원도','충청북도','충청남도','전라북도','전라남도','경상북도','경상남도'],
    stateAbbr: ['서울','부산','인천','대구','대전','광주','울산','경기','강원','충북','충남','전북','전남','경북','경남'],
    phone: '+82',
    currency: 'KRW',
    tld: '.kr',
    timezone: 'Asia/Seoul',
    flag: '🇰🇷',
    name: 'South Korea',
  },
  ES: {
    firstMale: ['Antonio','José','Manuel','Francisco','Juan','David','Miguel','Carlos','Pedro','Javier','Fernando','Luis','Sergio','Alejandro','Pablo'],
    firstFemale: ['María','Carmen','Josefa','Isabel','Dolores','Pilar','Teresa','Ana','Francisca','Laura','Cristina','Marta','Rosa','Lucía','Mercedes'],
    last: ['García','Rodríguez','González','Fernández','López','Martínez','Sánchez','Pérez','Gómez','Martín','Jiménez','Ruiz','Hernández','Díaz','Moreno','Muñoz','Álvarez','Romero','Alonso','Gutiérrez'],
    streets: ['Calle Mayor','Calle Real','Avenida Principal','Paseo de Gracia','Gran Via','Calle Toledo','Rambla','Alameda','Plaza Mayor','Calle Alcalá','Paseo del Prado','Calle Serrano','Castellana','Ronda','Plaza España'],
    cities: ['Madrid','Barcelona','Valencia','Sevilla','Zaragoza','Málaga','Murcia','Palma','Las Palmas','Bilbao','Alicante','Córdoba','Valladolid','Vigo','Gijón'],
    states: ['Madrid','Cataluña','Valencia','Andalucía','Galicia','Castilla y León','País Vasco','Castilla-La Mancha','Canarias','Murcia','Aragón','Extremadura','Asturias','Islas Baleares','Navarra'],
    stateAbbr: ['M','CT','V','AN','GA','CL','PV','CM','CN','MU','AR','EX','AS','IB','NA'],
    phone: '+34',
    currency: 'EUR',
    tld: '.es',
    timezone: 'Europe/Madrid',
    flag: '🇪🇸',
    name: 'Spain',
  },
  AU: {
    firstMale: ['Oliver','Noah','Jack','William','Henry','Leo','Charlie','Lucas','Thomas','Liam','Oscar','James','Ethan','Alexander','Mason'],
    firstFemale: ['Charlotte','Olivia','Amelia','Isla','Mia','Ava','Grace','Zoe','Chloe','Emily','Sophie','Harper','Ella','Ruby','Lily'],
    last: ['Smith','Jones','Williams','Brown','Wilson','Taylor','Johnson','White','Martin','Anderson','Thompson','Nguyen','Thomas','Walker','Harris','Lee','Ryan','Robinson','Kelly','King'],
    streets: ['George Street','Elizabeth Street','King Street','Queen Street','Collins Street','Bourke Street','Pitt Street','Market Street','Victoria Street','Railway Parade','High Street','Main Road','Beach Road','Park Avenue','Station Street'],
    cities: ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Gold Coast','Canberra','Newcastle','Wollongong','Geelong','Hobart','Townsville','Cairns','Darwin','Toowoomba'],
    states: ['New South Wales','Victoria','Queensland','Western Australia','South Australia','Tasmania','Australian Capital Territory','Northern Territory'],
    stateAbbr: ['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'],
    phone: '+61',
    currency: 'AUD',
    tld: '.au',
    timezone: 'Australia/Sydney',
    flag: '🇦🇺',
    name: 'Australia',
  },
  CA: {
    firstMale: ['Liam','Noah','Oliver','Ethan','Logan','Lucas','Jackson','Jacob','William','James','Benjamin','Alexander','Michael','Owen','Nathan'],
    firstFemale: ['Emma','Olivia','Ava','Charlotte','Sophia','Amelia','Emily','Isabella','Mia','Harper','Evelyn','Abigail','Ella','Scarlett','Grace'],
    last: ['Smith','Brown','Tremblay','Martin','Roy','Wilson','MacDonald','Gagnon','Johnson','Taylor','Anderson','Lee','White','Thompson','Moore','Young','King','Scott','Stewart','Campbell'],
    streets: ['Main Street','Queen Street','King Street','Yonge Street','Spadina Avenue','Bloor Street','Dundas Street','College Street','University Avenue','Bay Street','Front Street','Richmond Street','Wellington Street','Broadway','Commercial Drive'],
    cities: ['Toronto','Montreal','Vancouver','Calgary','Edmonton','Ottawa','Winnipeg','Quebec City','Hamilton','Kitchener','London','Victoria','Halifax','Oshawa','Windsor'],
    states: ['Ontario','Quebec','British Columbia','Alberta','Manitoba','Saskatchewan','Nova Scotia','New Brunswick','Newfoundland and Labrador','Prince Edward Island','Northwest Territories','Yukon','Nunavut'],
    stateAbbr: ['ON','QC','BC','AB','MB','SK','NS','NB','NL','PE','NT','YT','NU'],
    phone: '+1',
    currency: 'CAD',
    tld: '.ca',
    timezone: 'America/Toronto',
    flag: '🇨🇦',
    name: 'Canada',
  },
  FR: {
    firstMale: ['Gabriel','Louis','Raphaël','Arthur','Jules','Adam','Lucas','Hugo','Nathan','Léo','Ethan','Tom','Noah','Mathis','Maxime'],
    firstFemale: ['Emma','Jade','Louise','Alice','Chloé','Lina','Léa','Manon','Rose','Anna','Inès','Camille','Sarah','Zoé','Juliette'],
    last: ['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier'],
    streets: ['Rue de la République','Avenue des Champs-Élysées','Boulevard Haussmann','Rue de Rivoli','Avenue Montaigne','Rue du Faubourg Saint-Honoré','Boulevard Saint-Germain','Rue de la Paix','Avenue Victor Hugo','Rue Lafayette','Boulevard Voltaire','Rue Nationale','Place de la Concorde','Quai de la Seine','Rue Royale'],
    cities: ['Paris','Marseille','Lyon','Toulouse','Nice','Nantes','Strasbourg','Montpellier','Bordeaux','Lille','Rennes','Reims','Le Havre','Saint-Étienne','Toulon'],
    states: ['Île-de-France','Provence-Alpes-Côte d\'Azur','Auvergne-Rhône-Alpes','Occitanie','Nouvelle-Aquitaine','Hauts-de-France','Bretagne','Grand Est','Pays de la Loire','Normandie','Bourgogne-Franche-Comté','Centre-Val de Loire','Corse'],
    stateAbbr: ['IDF','PACA','ARA','OCC','NAQ','HDF','BRE','GES','PDL','NOR','BFC','CVL','COR'],
    phone: '+33',
    currency: 'EUR',
    tld: '.fr',
    timezone: 'Europe/Paris',
    flag: '🇫🇷',
    name: 'France',
  },
  IT: {
    firstMale: ['Leonardo','Francesco','Alessandro','Lorenzo','Mattia','Andrea','Gabriele','Riccardo','Tommaso','Davide','Giuseppe','Antonio','Marco','Luca','Giovanni'],
    firstFemale: ['Sofia','Giulia','Aurora','Alice','Ginevra','Emma','Giorgia','Greta','Beatrice','Anna','Chiara','Martina','Sara','Francesca','Alessia'],
    last: ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Mancini','Costa','Giordano','Rizzo','Lombardi','Moretti'],
    streets: ['Via Roma','Corso Italia','Via Nazionale','Via Garibaldi','Corso Vittorio Emanuele','Via Milano','Via Torino','Piazza del Duomo','Via Dante','Corso Buenos Aires','Via Venezia','Via Firenze','Viale Europa','Via della Repubblica','Corso Umberto'],
    cities: ['Roma','Milano','Napoli','Torino','Palermo','Genova','Bologna','Firenze','Bari','Catania','Venezia','Verona','Messina','Padova','Trieste'],
    states: ['Lazio','Lombardia','Campania','Piemonte','Sicilia','Liguria','Emilia-Romagna','Toscana','Puglia','Veneto','Calabria','Sardegna','Abruzzo','Marche','Umbria'],
    stateAbbr: ['LAZ','LOM','CAM','PIE','SIC','LIG','EMR','TOS','PUG','VEN','CAL','SAR','ABR','MAR','UMB'],
    phone: '+39',
    currency: 'EUR',
    tld: '.it',
    timezone: 'Europe/Rome',
    flag: '🇮🇹',
    name: 'Italy',
  },
  BR: {
    firstMale: ['Miguel','Arthur','Heitor','Bernardo','Théo','Davi','Gabriel','Pedro','Lorenzo','Benjamin','Matheus','Lucas','Nicolas','Guilherme','Rafael'],
    firstFemale: ['Alice','Helena','Laura','Maria','Valentina','Heloísa','Isabella','Manuela','Júlia','Sophia','Lorena','Lívia','Giovanna','Beatriz','Cecília'],
    last: ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes','Soares','Fernandes','Vieira','Barbosa'],
    streets: ['Avenida Paulista','Rua Augusta','Avenida Atlântica','Rua Oscar Freire','Avenida Ipiranga','Rua da Consolação','Avenida Brasil','Rua XV de Novembro','Avenida Rio Branco','Rua das Flores','Avenida Presidente Vargas','Rua Direita','Avenida Governador','Rua do Comércio','Avenida Central'],
    cities: ['São Paulo','Rio de Janeiro','Brasília','Salvador','Fortaleza','Belo Horizonte','Manaus','Curitiba','Recife','Porto Alegre','Belém','Goiânia','Guarulhos','Campinas','São Luís'],
    states: ['São Paulo','Rio de Janeiro','Minas Gerais','Bahia','Paraná','Rio Grande do Sul','Pernambuco','Ceará','Pará','Santa Catarina','Goiás','Maranhão','Amazonas','Espírito Santo','Distrito Federal'],
    stateAbbr: ['SP','RJ','MG','BA','PR','RS','PE','CE','PA','SC','GO','MA','AM','ES','DF'],
    phone: '+55',
    currency: 'BRL',
    tld: '.br',
    timezone: 'America/Sao_Paulo',
    flag: '🇧🇷',
    name: 'Brazil',
  },
  MX: {
    firstMale: ['Santiago','Mateo','Sebastián','Matías','Diego','Emiliano','Daniel','Alejandro','Leonardo','Miguel','Ángel','David','Emmanuel','Jesús','Carlos'],
    firstFemale: ['Sofía','Regina','Valentina','Renata','Isabella','Camila','Valeria','María','Ximena','Daniela','Natalia','Luciana','Victoria','Fernanda','Andrea'],
    last: ['Hernández','García','Martínez','López','González','Rodríguez','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Cruz','Morales','Reyes','Gutiérrez','Ortiz','Chávez'],
    streets: ['Avenida Insurgentes','Paseo de la Reforma','Avenida Juárez','Calle Madero','Avenida Revolución','Calle 5 de Mayo','Avenida Universidad','Calzada de Tlalpan','Eje Central','Avenida División del Norte','Boulevard Manuel Ávila Camacho','Periférico Sur','Viaducto Miguel Alemán','Avenida Chapultepec','Calzada Ignacio Zaragoza'],
    cities: ['Ciudad de México','Guadalajara','Monterrey','Puebla','Tijuana','León','Juárez','Zapopan','Mérida','Cancún','Querétaro','Toluca','Mexicali','Aguascalientes','Hermosillo'],
    states: ['Ciudad de México','Jalisco','Nuevo León','Puebla','Baja California','Guanajuato','Chihuahua','Yucatán','Quintana Roo','Querétaro','México','Sonora','Veracruz','Coahuila','Sinaloa'],
    stateAbbr: ['CDMX','JAL','NL','PUE','BC','GTO','CHIH','YUC','QROO','QRO','MEX','SON','VER','COAH','SIN'],
    phone: '+52',
    currency: 'MXN',
    tld: '.mx',
    timezone: 'America/Mexico_City',
    flag: '🇲🇽',
    name: 'Mexico',
  },
  RU: {
    firstMale: ['Александр','Дмитрий','Максим','Артем','Иван','Михаил','Даниил','Егор','Никита','Андрей','Алексей','Илья','Кирилл','Владимир','Роман'],
    firstFemale: ['Анастасия','Мария','Дарья','Алина','Екатерина','Полина','Ольга','Анна','Елена','Ирина','Татьяна','Юлия','Виктория','Наталья','Светлана'],
    last: ['Иванов','Смирнов','Кузнецов','Попов','Соколов','Лебедев','Козлов','Новиков','Морозов','Петров','Волков','Соловьев','Васильев','Зайцев','Павлов','Семенов','Голубев','Виноградов','Богданов','Воробьев'],
    streets: ['улица Ленина','проспект Мира','Московская улица','Советская улица','улица Гагарина','Красная улица','улица Пушкина','Садовая улица','Невский проспект','Тверская улица','Арбат','улица Кирова','проспект Победы','Центральная улица','улица Чехова'],
    cities: ['Москва','Санкт-Петербург','Новосибирск','Екатеринбург','Казань','Нижний Новгород','Челябинск','Самара','Омск','Ростов-на-Дону','Уфа','Красноярск','Воронеж','Пермь','Волгоград'],
    states: ['Москва','Санкт-Петербург','Московская область','Краснодарский край','Свердловская область','Республика Татарстан','Челябинская область','Ростовская область','Республика Башкортостан','Нижегородская область','Самарская область','Омская область','Красноярский край','Воронежская область','Пермский край'],
    stateAbbr: ['МОС','СПБ','МО','КК','СВЕ','ТАТ','ЧЕЛ','РОС','БАШ','НИЖ','САМ','ОМС','КРА','ВОР','ПЕР'],
    phone: '+7',
    currency: 'RUB',
    tld: '.ru',
    timezone: 'Europe/Moscow',
    flag: '🇷🇺',
    name: 'Russia',
  },
  IN: {
    firstMale: ['Aarav','Vivaan','Aditya','Arjun','Sai','Arnav','Ayaan','Krishna','Ishaan','Reyansh','Shaurya','Atharv','Pranav','Vihaan','Aarav'],
    firstFemale: ['Aadhya','Diya','Saanvi','Ananya','Kiara','Anika','Ira','Navya','Sara','Avni','Mira','Aanya','Pari','Riya','Myra'],
    last: ['Kumar','Singh','Sharma','Patel','Reddy','Gupta','Verma','Mehta','Joshi','Desai','Rao','Nair','Iyer','Bhat','Agarwal','Banerjee','Das','Khan','Ali','Shah'],
    streets: ['MG Road','Brigade Road','Residency Road','Commercial Street','Main Road','Station Road','Gandhi Road','Nehru Street','Park Street','Linking Road','Carter Road','Marine Drive','Anna Salai','T Nagar','Indiranagar'],
    cities: ['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Surat','Lucknow','Kanpur','Nagpur','Indore','Bhopal'],
    states: ['Maharashtra','Delhi','Karnataka','Telangana','Tamil Nadu','West Bengal','Gujarat','Rajasthan','Uttar Pradesh','Madhya Pradesh','Kerala','Punjab','Haryana','Bihar','Odisha'],
    stateAbbr: ['MH','DL','KA','TG','TN','WB','GJ','RJ','UP','MP','KL','PB','HR','BR','OR'],
    phone: '+91',
    currency: 'INR',
    tld: '.in',
    timezone: 'Asia/Kolkata',
    flag: '🇮🇳',
    name: 'India',
  },
  NL: {
    firstMale: ['Noah','Lucas','Sem','Milan','Levi','Luuk','Daan','Finn','Thijs','Bram','Jesse','Lars','Max','Tim','Tom'],
    firstFemale: ['Emma','Sophie','Julia','Mila','Anna','Tess','Lisa','Zoë','Eva','Sara','Lotte','Isa','Fleur','Noa','Lynn'],
    last: ['de Jong','Jansen','de Vries','van den Berg','van Dijk','Bakker','Janssen','Visser','Smit','Meijer','de Boer','Mulder','de Groot','Bos','Vos','Peters','Hendriks','van Leeuwen','Dekker','Brouwer'],
    streets: ['Hoofdstraat','Kerkstraat','Dorpsstraat','Stationsweg','Schoolstraat','Molenstraat','Marktstraat','Prins Hendrikstraat','Stationsplein','Nieuwstraat','Havenstraat','Waterloostraat','Oudegracht','Dam','Kalverstraat'],
    cities: ['Amsterdam','Rotterdam','Den Haag','Utrecht','Eindhoven','Groningen','Tilburg','Almere','Breda','Nijmegen','Apeldoorn','Haarlem','Arnhem','Zaanstad','Amersfoort'],
    states: ['Noord-Holland','Zuid-Holland','Utrecht','Noord-Brabant','Gelderland','Overijssel','Limburg','Groningen','Friesland','Flevoland','Zeeland','Drenthe'],
    stateAbbr: ['NH','ZH','UT','NB','GE','OV','LI','GR','FR','FL','ZE','DR'],
    phone: '+31',
    currency: 'EUR',
    tld: '.nl',
    timezone: 'Europe/Amsterdam',
    flag: '🇳🇱',
    name: 'Netherlands',
  },
  SE: {
    firstMale: ['Oscar','Lucas','William','Liam','Elias','Alexander','Hugo','Oliver','Charlie','Axel','Emil','Erik','Isak','Viktor','Filip'],
    firstFemale: ['Alice','Maja','Elsa','Ella','Olivia','Wilma','Ebba','Saga','Agnes','Freja','Alicia','Alma','Astrid','Julia','Stella'],
    last: ['Andersson','Johansson','Karlsson','Nilsson','Eriksson','Larsson','Olsson','Persson','Svensson','Gustafsson','Pettersson','Jonsson','Jansson','Hansson','Bengtsson','Jönsson','Lindberg','Jakobsson','Magnusson','Olofsson'],
    streets: ['Drottninggatan','Storgatan','Kungsgatan','Sveavägen','Vasagatan','Hamngatan','Biblioteksgatan','Götgatan','Birger Jarlsgatan','Strandvägen','Karlavägen','Valhallavägen','Östermalmsgatan','Norrlandsgatan','Sergels Torg'],
    cities: ['Stockholm','Göteborg','Malmö','Uppsala','Västerås','Örebro','Linköping','Helsingborg','Jönköping','Norrköping','Lund','Umeå','Gävle','Borås','Eskilstuna'],
    states: ['Stockholm','Västra Götaland','Skåne','Uppsala','Östergötland','Värmland','Gävleborg','Halland','Jönköping','Västerbotten','Dalarna','Södermanland','Västmanland','Norrbotten','Örebro'],
    stateAbbr: ['AB','O','M','C','E','S','X','N','F','AC','W','D','U','BD','T'],
    phone: '+46',
    currency: 'SEK',
    tld: '.se',
    timezone: 'Europe/Stockholm',
    flag: '🇸🇪',
    name: 'Sweden',
  },
  SG: {
    firstMale: ['Ryan','Ethan','Nathan','Jayden','Cayden','Marcus','Dylan','Sean','Kyan','Aiden','Lucas','Matthew','Joshua','Daniel','Isaac'],
    firstFemale: ['Chloe','Sophie','Emma','Emily','Charlotte','Olivia','Ava','Amelia','Grace','Isabella','Hannah','Mia','Sofia','Lily','Zara'],
    last: ['Tan','Lim','Lee','Ng','Ong','Wong','Goh','Chua','Chan','Koh','Teo','Ang','Yeo','Tay','Ho','Low','Sim','Chia','Cheng','Lau'],
    streets: ['Orchard Road','Marina Boulevard','Raffles Boulevard','Shenton Way','Robinson Road','Beach Road','North Bridge Road','South Bridge Road','Bukit Timah Road','Thomson Road','Serangoon Road','Tampines Avenue','Jurong West Street','Ang Mo Kio Avenue','Bedok North Avenue'],
    cities: ['Singapore','Jurong West','Woodlands','Tampines','Bedok','Ang Mo Kio','Hougang','Yishun','Choa Chu Kang','Bukit Batok','Sengkang','Punggol','Pasir Ris','Sembawang','Bukit Panjang'],
    states: ['Central Region','East Region','North Region','North-East Region','West Region'],
    stateAbbr: ['CR','ER','NR','NE','WR'],
    phone: '+65',
    currency: 'SGD',
    tld: '.sg',
    timezone: 'Asia/Singapore',
    flag: '🇸🇬',
    name: 'Singapore',
  },
  ZA: {
    firstMale: ['Liam','Junior','Enzokuhle','Aiden','Melokuhle','Lubanzi','Amahle','Omphile','Luke','Lwazi','Thabo','Sipho','Mandla','Tshepo','Bongani'],
    firstFemale: ['Amahle','Melokuhle','Emily','Rethabile','Princess','Precious','Lesedi','Angel','Lerato','Thando','Nomsa','Zanele','Noluthando','Lindiwe','Busisiwe'],
    last: ['Nkosi','Dlamini','Zulu','Mbatha','Khumalo','Sithole','Mthembu','Ngcobo','Ncube','Mahlangu','Ntuli','Mokoena','Mabaso','Radebe','Molefe','Phiri','Shezi','Ndlovu','Williams','Smith'],
    streets: ['Main Road','Church Street','Market Street','High Street','Long Street','Voortrekker Road','Oxford Road','Jan Smuts Avenue','Republic Road','Grayston Drive','Sandton Drive','William Nicol Drive','Rivonia Road','Witkoppen Road','Beyers Naude Drive'],
    cities: ['Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein','East London','Pietermaritzburg','Nelspruit','Polokwane','Kimberley','Rustenburg','George','Midrand','Centurion'],
    states: ['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','North West','Free State','Northern Cape'],
    stateAbbr: ['GP','WC','KZN','EC','LP','MP','NW','FS','NC'],
    phone: '+27',
    currency: 'ZAR',
    tld: '.za',
    timezone: 'Africa/Johannesburg',
    flag: '🇿🇦',
    name: 'South Africa',
  },
};

// Fallback for countries not explicitly defined
function getCountryData(code) {
  return DATA[code] || DATA['US'];
}

// All countries list for reference
const COUNTRIES = {
  'random': { name: 'Global Random', flag: '🌍' },
  'US': { name: 'United States', flag: '🇺🇸' },
  'GB': { name: 'United Kingdom', flag: '🇬🇧' },
  'CA': { name: 'Canada', flag: '🇨🇦' },
  'AU': { name: 'Australia', flag: '🇦🇺' },
  'DE': { name: 'Germany', flag: '🇩🇪' },
  'FR': { name: 'France', flag: '🇫🇷' },
  'JP': { name: 'Japan', flag: '🇯🇵' },
  'CN': { name: 'China', flag: '🇨🇳' },
  'IN': { name: 'India', flag: '🇮🇳' },
  'BR': { name: 'Brazil', flag: '🇧🇷' },
  'MX': { name: 'Mexico', flag: '🇲🇽' },
  'RU': { name: 'Russia', flag: '🇷🇺' },
  'KR': { name: 'South Korea', flag: '🇰🇷' },
  'ES': { name: 'Spain', flag: '🇪🇸' },
  'IT': { name: 'Italy', flag: '🇮🇹' },
  'NL': { name: 'Netherlands', flag: '🇳🇱' },
  'SE': { name: 'Sweden', flag: '🇸🇪' },
  'SG': { name: 'Singapore', flag: '🇸🇬' },
  'ZA': { name: 'South Africa', flag: '🇿🇦' },
};

// ---- Helpers ----
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndStr(n, chars='abcdefghijklmnopqrstuvwxyz0123456789') {
  return Array.from({length:n}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
}

// Luhn algorithm for credit card numbers
function luhnGenerate(prefix, length) {
  let num = prefix + '';
  while (num.length < length - 1) num += rndInt(0, 9);
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  const check = (10 - (sum % 10)) % 10;
  return num + check;
}

function generateCard() {
  const types = [
    { name: 'Visa', prefix: '4', length: 16 },
    { name: 'Mastercard', prefix: '51', length: 16 },
    { name: 'Amex', prefix: '37', length: 15 },
    { name: 'Discover', prefix: '60', length: 16 },
  ];
  const t = rnd(types);
  const num = luhnGenerate(t.prefix, t.length);
  const month = String(rndInt(1, 12)).padStart(2, '0');
  const year = String(rndInt(26, 32));
  const cvv = String(rndInt(100, 999));
  return { type: t.name, number: num, expiry: `${month}/${year}`, cvv };
}

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const MARITAL = ['Single','Married','Divorced','Widowed'];
const EDUCATION = ['High School','Associate','Bachelor','Master','PhD'];
const JOBS = ['Software Engineer','Product Manager','Data Analyst','Marketing Manager','Sales Representative','Accountant','Designer','Teacher','Doctor','Lawyer','Nurse','Architect'];
const DEPARTMENTS = ['Engineering','Marketing','Finance','Operations','HR','Sales','Design','Legal','Product','Research'];
const COMPANIES = ['Acme Corp','TechVision Ltd','Global Solutions','Nexus Industries','Apex Systems','Vertex Analytics','Pinnacle Group','Horizon Digital','Summit Technologies','Catalyst Partners'];

function generateOne(code, gender, includeCompany, includeCoords, hideSensitive) {
  if (code === 'random') {
    const codes = Object.keys(COUNTRIES).filter(c => c !== 'random');
    code = rnd(codes);
  }
  const d = getCountryData(code);
  const countryInfo = COUNTRIES[code] || { name: code, flag: '🌍' };

  const isFemaleBool = gender === 'female' || (gender === 'random' && Math.random() > 0.5);
  const genderStr = isFemaleBool ? 'Female' : 'Male';
  const firstName = rnd(isFemaleBool ? d.firstFemale : d.firstMale);
  const lastName = rnd(d.last);
  const age = rndInt(18, 75);
  const birthYear = new Date().getFullYear() - age;
  const birthMonth = String(rndInt(1, 12)).padStart(2, '0');
  const birthDay = String(rndInt(1, 28)).padStart(2, '0');
  const email = `${firstName.toLowerCase().replace(/\s/g,'')}${lastName.toLowerCase()}${rndInt(10,999)}@${['gmail.com','yahoo.com','outlook.com','hotmail.com'][rndInt(0,3)]}`;
  const username = `${firstName.toLowerCase()}${rndInt(10,9999)}`;
  const phone = `${d.phone} ${rndInt(100,999)}-${rndInt(1000,9999)}`;
  const ssn = hideSensitive ? '***-**-****' : `${rndInt(100,999)}-${rndInt(10,99)}-${rndInt(1000,9999)}`;

  const streetNum = rndInt(1, 9999);
  const street = rnd(d.streets);
  const city = rnd(d.cities);
  const stateIdx = rndInt(0, d.states.length - 1);
  const state = d.states[stateIdx];
  const stateAbbr = d.stateAbbr[stateIdx] || state;
  const zip = String(rndInt(10000, 99999));
  const fullAddress = `${streetNum} ${street}, ${city}, ${stateAbbr} ${zip}, ${countryInfo.name}`;

  const card = generateCard();
  const maskedCard = hideSensitive ? `****-****-****-${card.number.slice(-4)}` : card.number.replace(/(.{4})/g, '$1-').slice(0,-1);
  const income = hideSensitive ? '•••,•••' : `${rndInt(30,200)},000`;
  const workPhone = hideSensitive ? '***-***-****' : `${d.phone} ${rndInt(100,999)}-${rndInt(1000,9999)}`;
  const cvv = hideSensitive ? '***' : card.cvv;

  const passport = hideSensitive ? '••••••••' : rndStr(9,'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').toUpperCase();
  const license = hideSensitive ? '••••••••' : rndStr(8,'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').toUpperCase();
  const taxId = hideSensitive ? '***-**-****' : `${rndInt(100,999)}-${rndInt(10,99)}-${rndInt(1000,9999)}`;
  const website = `https://www.${firstName.toLowerCase()}${lastName.toLowerCase()}${d.tld}`;

  const lat = includeCoords ? (rndInt(-90000, 90000) / 1000).toFixed(3) : null;
  const lng = includeCoords ? (rndInt(-180000, 180000) / 1000).toFixed(3) : null;

  return {
    code, countryName: countryInfo.name, flag: countryInfo.flag,
    firstName, lastName, fullName: `${firstName} ${lastName}`,
    username, gender: genderStr, age,
    birthday: `${birthYear}-${birthMonth}-${birthDay}`,
    ssn, email, phone,
    streetNum, street, city, state, stateAbbr, zip, fullAddress,
    timezone: d.timezone,
    job: rnd(JOBS), department: rnd(DEPARTMENTS),
    company: includeCompany ? rnd(COMPANIES) : null,
    income, workPhone,
    cardType: card.type, cardNumber: maskedCard, cardExpiry: card.expiry, cardCVV: cvv,
    marital: rnd(MARITAL), education: rnd(EDUCATION),
    bloodType: rnd(BLOOD_TYPES),
    passport, license, taxId, website,
    lat, lng,
  };
}

// ---- State ----
let currentBatch = [];
let history = JSON.parse(localStorage.getItem('addrHistory') || '[]');

function generateAddresses() {
  const code = document.getElementById('addrCountry').value;
  const qty = parseInt(document.getElementById('addrQty').value, 10);
  const gender = document.getElementById('addrGender').value;
  const includeCompany = document.getElementById('includeCompany').checked;
  const includeCoords = document.getElementById('includeCoords').checked;
  const hideSensitive = document.getElementById('hideSensitive').checked;

  currentBatch = Array.from({length: qty}, () => generateOne(code, gender, includeCompany, includeCoords, hideSensitive));
  renderResults();
  saveHistory(currentBatch[0]);
}

function refreshAddresses() { generateAddresses(); }

function renderResults() {
  const container = document.getElementById('addressResults');
  const summaryTable = document.getElementById('summaryTable');
  const summaryBody = document.getElementById('summaryTableBody');
  if (!container) return;

  container.innerHTML = currentBatch.map((p, i) => `
    <div class="address-record">
      <div class="address-record-header">
        <h3>${p.flag} ${p.fullName} — ${p.countryName}</h3>
        <button class="btn btn-outline btn-sm" style="color:#fff;border-color:rgba(255,255,255,.4)" onclick='copySingle(${i})'>📋 Copy JSON</button>
      </div>
      <div class="address-blocks">
        <div class="address-block">
          <div class="address-block-title">👤 Basic Info</div>
          ${field('Name', p.fullName)}
          ${field('Username', p.username)}
          ${field('Gender / Age', `${p.gender}, ${p.age}`)}
          ${field('Birthday', p.birthday)}
          ${field('ID / SSN', p.ssn)}
          ${field('Email', p.email)}
          ${field('Phone', p.phone)}
        </div>
        <div class="address-block">
          <div class="address-block-title">🏠 Address</div>
          ${field('Country', `${p.flag} ${p.countryName}`)}
          ${field('State / Province', p.state)}
          ${field('City', p.city)}
          ${field('Street', `${p.streetNum} ${p.street}`)}
          ${field('ZIP Code', p.zip)}
          ${field('Timezone', p.timezone)}
          ${p.lat ? field('Coordinates', `${p.lat}, ${p.lng}`) : ''}
        </div>
        <div class="address-block">
          <div class="address-block-title">💼 Employment & Credit Card</div>
          ${field('Job Title', p.job)}
          ${field('Department', p.department)}
          ${p.company ? field('Company', p.company) : ''}
          ${field('Annual Income', p.income)}
          ${field('Work Phone', p.workPhone)}
          ${field('Card Type', p.cardType)}
          ${field('Card Number', p.cardNumber)}
          ${field('Expiry', p.cardExpiry)}
          ${field('CVV', p.cardCVV)}
        </div>
        <div class="address-block">
          <div class="address-block-title">📋 More Details</div>
          ${field('Marital Status', p.marital)}
          ${field('Education', p.education)}
          ${field('Blood Type', p.bloodType)}
          ${field('Passport No.', p.passport)}
          ${field('Driver License', p.license)}
          ${field('Tax ID', p.taxId)}
          ${field('Website', p.website)}
        </div>
      </div>
    </div>
  `).join('');

  // Summary table
  if (currentBatch.length > 1) {
    summaryTable.style.display = 'block';
    summaryBody.innerHTML = currentBatch.map((p, i) => `
      <tr>
        <td>${p.fullName}</td>
        <td>${p.flag} ${p.countryName}</td>
        <td>${p.city}</td>
        <td>${p.phone}</td>
        <td>${p.email}</td>
        <td><button class="btn btn-outline btn-xs" onclick='copySingle(${i})'>Copy</button></td>
      </tr>
    `).join('');
  } else {
    summaryTable.style.display = 'none';
  }
}

function field(key, val) {
  return `<div class="address-field"><span class="address-field-key">${key}</span><span class="address-field-val">${val}</span></div>`;
}

function copySingle(i) {
  navigator.clipboard.writeText(JSON.stringify(currentBatch[i], null, 2));
  showToast('Copied as JSON!');
}

function copyCurrentJSON() {
  if (currentBatch.length === 0) { showToast('Generate first!'); return; }
  const data = currentBatch.length === 1 ? currentBatch[0] : currentBatch;
  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  showToast('Copied as JSON!');
}

function exportJSON() {
  if (currentBatch.length === 0) { showToast('Generate first!'); return; }
  const blob = new Blob([JSON.stringify(currentBatch, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'fake-addresses.json');
}

function exportCSV() {
  if (currentBatch.length === 0) { showToast('Generate first!'); return; }
  const keys = ['fullName','gender','age','birthday','email','phone','city','state','countryName','zip','job','company'];
  const header = keys.join(',');
  const rows = currentBatch.map(p => keys.map(k => `"${(p[k]||'').toString().replace(/"/g,'""')}"`).join(','));
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  downloadBlob(blob, 'fake-addresses.csv');
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function clearHistory() {
  history = [];
  localStorage.removeItem('addrHistory');
  renderHistory();
  showToast('History cleared');
}

function saveHistory(person) {
  if (!person) return;
  history.unshift({ name: person.fullName, country: person.flag + ' ' + person.countryName, ts: Date.now() });
  history = history.slice(0, 20);
  localStorage.setItem('addrHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const el = document.getElementById('addrHistory');
  if (!el) return;
  if (history.length === 0) { el.innerHTML = '<p style="color:#94a3b8;font-size:13px">No history yet</p>'; return; }
  el.innerHTML = history.map(h => `
    <div class="addr-history-item">
      <strong>${h.name}</strong>
      ${h.country} · ${new Date(h.ts).toLocaleTimeString()}
    </div>
  `).join('');
}

// Init
window.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('addrCountry')) {
    renderHistory();
    generateAddresses();
  }
});

