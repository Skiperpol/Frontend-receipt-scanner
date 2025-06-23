# Frontend Receipt Scanner

Ten projekt to aplikacja w frameworku **Next.js** (React + TypeScript) służąca do zarządzania wydatkami na podstawie zeskanowanych paragonów. Umożliwia logowanie, rejestrację użytkowników, dodawanie oraz edytowanie transakcji i produktów, a także import paragonów za pomocą aparatu telefonu.

## Dokumentacja użytkownika

1. **Logowanie / Rejestracja**
   - Po uruchomieniu aplikacji zostaniesz przekierowany na stronę logowania (`/login`).
   - Jeżeli nie masz konta, przejdź do `/register` i wypełnij formularz.

2. **Transakcje**
   - Po zalogowaniu domyślną sekcją jest lista transakcji (`/transactions`).
   - Z poziomu listy możesz przejść do szczegółów transakcji, edytować ją lub usunąć.
   - Sekcja **Dodaj transakcję** umożliwia ręczne tworzenie pustej transakcji.

3. **Skanowanie paragonów**
   - W sekcji **Skan** (`/scan`) zrób zdjęcie paragonu aparatem telefonu lub wybierz plik z dysku.
   - Aplikacja wyśle obraz do API, utworzy odpowiednią transakcję i produkty, a następnie przekieruje do szczegółów.

4. **Dzienny raport**
   - Widok **Dzienny raport** (`/daily-raport`) prezentuje podsumowanie przychodów/wydatków w układzie dziennym lub miesięcznym.

## Dokumentacja techniczna

### Wymagania

- Node.js w wersji 20 lub nowszej
- Menedżer pakietów `npm`

### Instalacja

```bash
cd receipt-project
npm install
```

Stwórz plik `.env.local` i uzupełnij zmienną środowiskową wskazującą adres backendu:

```bash
NEXT_PUBLIC_API_BASE_URL=http://adres-backendu
```

### Uruchomienie w trybie deweloperskim

```bash
npm run dev       # uruchomienie na http://localhost:3000
npm run phone     # serwer dostępny również w sieci lokalnej
```

Aplikację produkcyjną można zbudować poleceniem `npm run build` i uruchomić `npm start`.

### Struktura projektu

- **src/app** – pliki stron Next.js
  - `login`, `register` – formularze uwierzytelniania
  - `(protected)` – część dostępna tylko po zalogowaniu (transakcje, skanowanie, raporty)
- **src/components** – komponenty interfejsu użytkownika oraz katalog `ui` zawierający komponenty z biblioteki *shadcn/ui*
- **src/context** – globalne konteksty Reacta, m.in. `AuthContext` odpowiadający za stan logowania
- **src/lib** – pomocnicze funkcje (np. `api.ts` wykonujący zapytania do backendu)
- **src/hooks** – własne hooki Reacta

### Zależności

Najważniejsze biblioteki użyte w projekcie:

- **Next.js** 15 (framework React)
- **React** 19
- **shadcn/ui** wraz z komponentami [Radix UI](https://www.radix-ui.com/)
- **Tailwind CSS** (konfiguracja w `src/app/globals.css`)

Pełną listę pakietów znajdziesz w `package.json`.

---

Projekt jest przygotowany do współpracy z backendem udostępniającym REST API. Po podaniu prawidłowego `NEXT_PUBLIC_API_BASE_URL` możesz od razu rozpocząć pracę lokalnie lub wdrożyć aplikację na dowolny hosting obsługujący Node.js.
### Docker

Aby zbudować obraz i uruchomić aplikację w kontenerze, wykonaj następujące kroki:

```bash
cd receipt-project
# budowanie obrazu
docker build -t receipt-scanner .

# uruchomienie kontenera
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://adres-backendu \
  receipt-scanner
```

Domyślnie aplikacja będzie dostępna pod adresem `http://localhost:3000`.