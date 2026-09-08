## Solita Dev Academy Exercise: Autumn 2026 - Electricity Data App

### Live

[https://e-lec-tri-ci-ty.vercel.app/](https://e-lec-tri-ci-ty.vercel.app/)

### Running locally

```zsh
git clone https://github.com/villivald/e-lec-tri-ci-ty.git
cd e-lec-tri-ci-ty
npm ci
```

#### Option 1 - Local dev

```zsh
# Run PostgreSQL and Adminer in Docker
docker compose up --build -d db adminer
# Run both apps
npm run dev
```

#### Option 2 - Containerized backend

```zsh
# Run PostgreSQL, Adminer and the backend in Docker
docker compose up --build -d
# Run frontend
npm run dev --workspace @electricity/web
```

#### Checks and tests

```zsh
# Linting and type checking
npm run lint
npm run typecheck
# Api tests
npm test
# E2E tests
npm run test:e2e
```

### Miten käytin tekoälyä

- Tässä tehtävässä käytin pääsääntöisesti ChatGPT Codexia (VS Coden kautta) - 5.6 Sol ja 6 Astra malleja.
- Käytin tekoälyä melko paljon apuna (ajan puutteen vuoksi) toteutuksen suunnittelussa, koodin generoinnissa, refaktoroinnissa ja testien kehittämisessä. Arvioin ehdotetut muutokset, tein teknologia- ja rajauspäätökset sekä yksinkertaistin toteutusta tarkastelemalla sitä useaan otteeseen.
- Alkusuunnitelman laatiminen - laadin oman suunnitelman poimimalla hyviä ratkaisuja tekoälyn tekemästä suunnitelmasta.
- “Keskustelu” teknologiavalinnoista. Pyysin ehdottamaan juuri tähän tehtävään sopivia teknologioita ja arvioimaan minun omat valinnat sekä tarjoamaan vaihtoehtoja.
- Datan analysointi ja siihen liittyvät huomioon otettavat kohdat - tästä oli apua, sillä ymmärsin etukäteen mitä potentiaalisia ongelmakohtia data sisältää, kuten puuttuvia tietoja jne.
- SQL-kyselyjen muodostaminen/tarkistaminen - tässä toteutuksessa käytettävien monimutkaisempien SQL-kyselyjen kirjoittaminen ei kuulu vahvuuksiini, tässä tekoälystä oli apua.
- Koodikatselmoinnit useammassa vaiheessa.
- Kaikki tekoälyn luomat osuudet on tarkastettu ja tarvittaessa korjattu.

### Ratkaisut ja käytetyt teknologiat (ja miksi valitsin juuri näitä)

- React - alussa ajatuksena oli käyttää Next.js:ää, ja toteuttaa myös yksinkertainen API sen avulla. Lopulta kun luin tehtävänantoa tarkemmin päädyin kuitenkin Reactin ja Viten yhdistelmään, sillä tuntui että näin saisin selkeämmän arkkitehtuurin juuri tämän tehtävän puitteissa - eli frontend ja backend olisi erillään, ja hyötyjä joita Next.js tuo mukanaan ei välttämättä edes tarvita tämän kokoisessa harjoitussovelluksessa (esim. routing, ssr, seo jne).
- Fastify - tästä frameworkista minulla oli alussa aika pintapuolinen käsitys, olen aikaisemmin enemmän käyttänyt Expressia, mutta ajattelin että olisi hyvä tutustua tähän samalla, koska tästäkin harjoituksesta olisi hyvä oppia jotain. Etuna on myös esim. sisäänrakennettu pyyntöjen validointi.
- MUI - tuttu ja turvallinen vaihtoehto, ei välttämättä visuaalisesti tyylikkäin mielestäni, mutta ratkaisevana tekijänä tässä oli helppokäyttöisyys, sekä se että samasta tuoteperheestä löytyy myös pagination- ja charts- ratkaisut.
- Fetch ja oma hook - API-pyynnöt tehdään selaimen fetch-rajapinnalla. Erillistä tiedonhakukirjastoa (esim. TanStack Query) ei tarvittu, koska sovellus vain lukee tietoja kahdesta API-päätepisteestä.
- Playwright - Käytin sitä keskeisten käyttöpolkujen testaamiseen selaimessa. Testit kattavat esimerkiksi haun, lajittelun, sivutuksen, päivän tietojen avaamisen sekä virhetilanteesta palautumisen.
- Vercel - olen käyttänyt sitä paljon omissa harrasteprojekteissani, joten se tuntui tutulta ja helppokäyttöiseltä vaihtoehdolta. Frontend ja backend on julkaistu erillisinä Vercel-projekteina. PostgreSQL-tietokanta sijaitsee Neonissa.

### Seuraavat mahdolliset kehityssuunnat, jotka tulivat mieleen (ei tärkeysjärjestyksessä)

- Testien integroiminen osaksi CI/CD putkea, esim github actionsin kautta.
- Responsiivisuus (tai mobiiliversio) - nykyinen versio on responsiivinen mutta siinä on parantamisen varaa.
- Saavutettavuustarkastus ja siihen liittyvät korjaukset. Tämä olisi oikeassa projektissa mielestäni välttämätöntä, mutta ei valitettavasti mahdu harjoitustehtävän scopeen ajan puitteissa.
- Kieliversiot (esim. fi/en toggle)
- Väriteemat (ainakin tumma/vaalea toggle jne)
- Autentikointi/käyttäjäprofiilit
- Datan muokkaaminen (esim. ylläpitoa varten)
