-- ================================================================
-- me&who — Test Seed Data
-- Crea: 200 utenti, 50 post, follow relationships
-- Password di tutti gli utenti test: Test1234!
-- Esegui nel Supabase SQL Editor
-- ================================================================

DO $$
DECLARE
  pw          TEXT;
  admin_id    UUID;
  uid         UUID;
  user_ids    UUID[] := ARRAY[]::UUID[];

  first_names TEXT[] := ARRAY[
    'Marco','Giulia','Luca','Sara','Alessandro','Valentina','Matteo',
    'Chiara','Davide','Francesca','Andrea','Elena','Simone','Laura',
    'Roberto','Federica','Stefano','Martina','Gabriele','Alice',
    'Riccardo','Beatrice','Lorenzo','Sofia','Francesco','Elisa',
    'Diego','Marta','Antonio','Camilla','Nicola','Giorgia','Emanuele',
    'Alessia','Pietro','Monica','Fabio','Silvia','Daniele','Serena'
  ];
  last_names TEXT[] := ARRAY[
    'Rossi','Bianchi','Ferrari','Conti','Ricci','Russo','Esposito',
    'Romano','Colombo','Moretti','Marino','Greco','Giordano','Lombardi',
    'Mancini','Barbieri','Fontana','Santoro','De Luca','Marini',
    'Costa','Ferrara','Leone','Longo','Gallo','Vitale','Pellegrini',
    'Gatti','Bruno','Caruso'
  ];
  roles  TEXT[] := ARRAY['user','user','startupper','startupper','startupper','researcher','researcher'];
  cities TEXT[] := ARRAY[
    'Milano','Roma','Torino','Napoli','Bologna','Firenze','Venezia',
    'Genova','Palermo','Bari','Catania','Verona','Padova','Trieste',
    'Brescia','Modena','Parma','Cagliari','Perugia','Trento'
  ];
  bios TEXT[] := ARRAY[
    'Appassionato di innovazione e tecnologia 🚀',
    'Founder @ stealth startup nel settore CleanTech',
    'PhD candidate in Computer Science @ Politecnico di Milano',
    'UX/UI Designer con focus sul futuro dei prodotti digitali',
    'Building the next B2B SaaS tool, one sprint at a time',
    'Ricercatrice in biotecnologie applicate e drug discovery',
    'Ex Googler, ora costruisco qualcosa di mio',
    'Maker e hardware hacker nel tempo libero',
    'Appassionata di AI e computer vision',
    'Open-source contributor e dev freelance',
    'Climate tech founder — saving the planet one PR at a time 🌍',
    'Serial entrepreneur, fallito 2 volte ma non mi arrendo',
    'Full-stack developer, caffè e codice ogni giorno ☕',
    'Ricercatore in neuroscienze computazionali',
    'Designer di prodotto che ama i dati e le persone',
    NULL, NULL
  ];

  post_titles TEXT[] := ARRAY[
    'Come ho lanciato la mia prima startup in 30 giorni',
    'AI nel 2025: cosa ci aspetta davvero',
    'Il mio percorso da ricercatore a fondatore',
    'Lean startup vs. design thinking: qual è meglio?',
    'Come trovare il co-founder ideale su me&who',
    'Fundraising in Italia: la guida completa',
    'Deep learning per principianti: dove iniziare',
    'Product-market fit: come sapere quando l''hai trovato',
    'Perché ho lasciato Google per fare la startup',
    'Note sulla ricerca in AI generativa',
    'Come costruire una community da zero',
    'Il futuro del lavoro remoto nelle startup',
    'Da MVP a scaling: le lezioni che ho imparato',
    'Open source vs. SaaS: la mia esperienza',
    'Biotech in Italia: opportunità e sfide',
    'Come ho raccolto 500k€ senza pitch deck',
    'Pensieri sulla sostenibilità nell''era tech',
    'Il mio stack tech per progetti indie',
    'Networking autentico: qualità vs. quantità',
    'Cosa ho imparato dopo 2 anni di startup'
  ];
  post_contents TEXT[] := ARRAY[
    'Ho deciso di condividere il mio percorso con voi. Tutto è iniziato con una semplice domanda: "Perché questo problema non è ancora risolto?" Da lì, 30 giorni intensi di validazione, prototipi e conversazioni con potenziali clienti. Il risultato? Il mio primo prodotto live.',
    'Stiamo vivendo un momento unico. L''AI non è più fantascienza: è il codice che gira in produzione ogni giorno. Ma cosa distinguerà i vincitori dai perdenti nei prossimi 12 mesi? Spoiler: non è il modello, è il dataset.',
    'Tre anni fa ero in laboratorio a fare ricerca su sistemi distribuiti. Oggi ho una startup con 8 persone. Il salto è stato brutale e bellissimo. Ecco cosa mi ha sorpreso di più.',
    'Ho testato entrambi gli approcci nella stessa startup, in momenti diversi. Lean startup mi ha salvato dall''overengineering. Design thinking mi ha aiutato a scoprire pain point nascosti. La verità? Servono entrambi.',
    'Trovare il co-founder è più difficile che trovare un investitore. Devi lavorare con questa persona tutti i giorni, attraverso momenti difficili. Ecco i criteri che ho usato per fare la scelta giusta.',
    'Il ecosistema startup italiano sta maturando, ma ci sono ancora gap enormi rispetto ad altri paesi europei. Ho parlato con 20 investitori negli ultimi 6 mesi: ecco cosa cercano davvero.',
    'Deep learning sembra magia finché non capisci la matematica sotto. Ho creato una lista delle risorse migliori per iniziare, da zero a implementazione in production, tutte gratuite.',
    'Ho sprecato 18 mesi costruendo features che nessuno voleva. Poi ho trovato il PMF quasi per caso. Questo post è la storia di quella svolta e i segnali che non avevo visto.',
    'La decisione più difficile della mia carriera. Stipendio sicuro, benefits incredibili, lavoro interessante. Ma qualcosa mancava. Vi racconto perché ho mollato tutto e se ne valeva la pena (spoiler: sì).',
    'Sto facendo ricerca su sistemi di generazione di testo controllata. Condivido alcune note e osservazioni dalle ultime settimane di esperimenti. Feedback sempre benvenuto.',
    'Una community non si costruisce, si coltiva. Ho passato un anno a capire questa differenza. Le lezioni che ho imparato sono applicabili a qualsiasi contesto, dalla startup al progetto open source.',
    'Post-pandemia, il remote work è diventato default in molte startup. Ma quali sono le implicazioni a lungo termine sulla cultura aziendale, sulla collaborazione e sull''innovazione?',
    'Da 0 a 10.000 utenti, le sfide cambiano completamente. Quello che funzionava a 100 utenti spezza tutto a 10.000. Ecco le lezioni più dolorose e preziose del nostro journey.',
    'Ho rilasciato il mio progetto principale come open source dopo 2 anni di sviluppo. La reazione della community mi ha sorpreso. Ma soprattutto ho imparato qualcosa di fondamentale sul valore del codice.',
    'Il settore biotech italiano ha potenziale enorme ma infrastruttura limitata. Sto cercando di capire dove si trovano le vere opportunità e dove invece ci sono solo hype. Le mie osservazioni finora.',
    'Non avevo un pitch deck, non avevo un deck finanziario, non avevo neanche un logo decente. Eppure ho chiuso un round seed. Ecco come ho convinto gli investitori con sole 10 slides.',
    'Tech e sostenibilità non sono opposti. Possiamo costruire prodotti scalabili che abbiano un impatto positivo sul pianeta. Ma richiede scelte coraggiose fin dal primo giorno.',
    'Sono un indie hacker e uso uno stack volutamente noioso: Next.js, Supabase, Tailwind. Niente microservizi, niente Kubernetes. Ecco perché questa scelta mi permette di muovermi veloce.',
    'Il networking che funziona non è quello delle business card alle conferenze. È quello che nasce da conversazioni autentiche, da contenuti che aiutano davvero, da relazioni che costruisci nel tempo.',
    'Due anni fa ho fondato la mia startup con grandi aspettative. Alcune si sono avverate, molte no. Questo è un bilancio onesto di cosa ho imparato, cosa avrei fatto diversamente e cosa mi sorprende ancora.'
  ];

  fname   TEXT; lname TEXT; display TEXT; uname TEXT;
  role_v  TEXT; bio_v TEXT; city_v TEXT;
  post_i  INTEGER; author_uid UUID;
  i       INTEGER; j INTEGER;
BEGIN
  -- Compute password hash once (Test1234!)
  pw := crypt('Test1234!', gen_salt('bf'));

  -- Get admin id
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;

  -- ────────────────────────────────────────────────────────────────
  -- 1. Create 200 test users
  -- ────────────────────────────────────────────────────────────────
  FOR i IN 1..200 LOOP
    uid    := gen_random_uuid();
    fname  := first_names[1 + (i % array_length(first_names, 1))];
    lname  := last_names [1 + ((i * 7) % array_length(last_names, 1))];
    display:= fname || ' ' || lname;
    uname  := lower(regexp_replace(fname, '[^a-zA-Z]', '', 'g'))
           || lower(regexp_replace(lname, '[^a-zA-Z]', '', 'g'))
           || i::text;

    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'seed_' || i || '@test.meandwho.it',
      pw,
      NOW() - ((200 - i)::text || ' hours')::interval,
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('username', uname, 'display_name', display),
      NOW() - ((200 - i)::text || ' hours')::interval,
      NOW(),
      '', '', '', ''
    ) ON CONFLICT (id) DO NOTHING;

    user_ids := array_append(user_ids, uid);
  END LOOP;

  -- ────────────────────────────────────────────────────────────────
  -- 2. Update profiles with role, bio, city
  --    (trigger might have created minimal profiles already)
  -- ────────────────────────────────────────────────────────────────
  FOR i IN 1..200 LOOP
    role_v := roles[1 + (i % array_length(roles, 1))];
    bio_v  := bios [1 + (i % array_length(bios, 1))];
    city_v := cities[1 + ((i * 3) % array_length(cities, 1))];

    -- Upsert in case trigger didn't fire
    INSERT INTO public.profiles (id, username, display_name, role, bio, city, created_at, updated_at)
    VALUES (
      user_ids[i],
      lower(regexp_replace(first_names[1+(i%array_length(first_names,1))], '[^a-zA-Z]','','g'))
      || lower(regexp_replace(last_names[1+((i*7)%array_length(last_names,1))], '[^a-zA-Z]','','g'))
      || i::text,
      first_names[1+(i%array_length(first_names,1))] || ' ' || last_names[1+((i*7)%array_length(last_names,1))],
      role_v, bio_v, city_v,
      NOW() - ((200 - i)::text || ' hours')::interval,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      bio  = EXCLUDED.bio,
      city = EXCLUDED.city,
      updated_at = NOW();
  END LOOP;

  -- ────────────────────────────────────────────────────────────────
  -- 3. Create 50 test posts (from random seed users)
  -- ────────────────────────────────────────────────────────────────
  FOR post_i IN 1..50 LOOP
    -- Pick author from seed users (cycling through first 50)
    author_uid := user_ids[post_i];

    INSERT INTO public.posts (
      id, author_id, title, content, tags, visibility, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      author_uid,
      post_titles[1 + ((post_i - 1) % array_length(post_titles, 1))],
      post_contents[1 + ((post_i - 1) % array_length(post_contents, 1))],
      ARRAY(
        SELECT unnest(ARRAY['startup','innovazione','tech','ai','prodotto','ricerca','founder','Italia'])
        LIMIT 2 + (post_i % 3)
      ),
      'public',
      NOW() - ((50 - post_i)::text || ' hours')::interval,
      NOW()
    );
  END LOOP;

  -- ────────────────────────────────────────────────────────────────
  -- 4. Follow relationships
  -- ────────────────────────────────────────────────────────────────

  -- 60 random users follow admin
  IF admin_id IS NOT NULL THEN
    FOR i IN 1..60 LOOP
      INSERT INTO public.follows (follower_id, following_id, created_at)
      VALUES (user_ids[i], admin_id, NOW() - ((60 - i)::text || ' hours')::interval)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Mutual follows between pairs (users 1-100 follow users 101-200 and vice versa)
  FOR i IN 1..100 LOOP
    j := 201 - i; -- mirror index (1↔200, 2↔199, ...)
    IF j <= 200 AND i <> j THEN
      INSERT INTO public.follows (follower_id, following_id, created_at)
      VALUES (user_ids[i], user_ids[j], NOW() - ((100 - i)::text || ' hours')::interval)
      ON CONFLICT DO NOTHING;

      INSERT INTO public.follows (follower_id, following_id, created_at)
      VALUES (user_ids[j], user_ids[i], NOW() - ((100 - i + 1)::text || ' hours')::interval)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Chain follows: each user follows the next 3 (creates a social graph)
  FOR i IN 1..197 LOOP
    FOR j IN 1..3 LOOP
      INSERT INTO public.follows (follower_id, following_id, created_at)
      VALUES (user_ids[i], user_ids[i + j], NOW() - ((200 - i)::text || ' hours')::interval)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seed completato: 200 utenti, 50 post, follow relationships creati.';
  RAISE NOTICE 'Password per tutti: Test1234!';
END $$;
