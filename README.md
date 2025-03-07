# CMSC 128 A24L Alumni Tracker App

## Please Take Time to Read

### Notes:

- Please make sure that the node version is **at least Version 18.18.0**
- It is recommended to run the app in the Powershell because hindi nag-aauto reload kapag sa WSL irrun.
- _**DO NOT PUSH IN THE MAIN BRANCH**_. Create/update into a new branch for any updates.

### Steps to load the project:

1. Clone the repository:
   ```bash
   git clone https://github.com/rdadormeo/CMSC128-A24L-Backend.git
   ```
2. Run:

   ```bash
   cd alumni-tracker
   ```

3. Run:
   ```bash
   npm i
   ```

### To run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Commit Messages Conventions

#### For easier, well-documented, and more manageable tracking of changes, please follow these commit message conventions when making a commit.

- `feat` - commits that add or remove a new feature to the API or UI
- `fix` - commits that fix an API or UI bug of a preceded `feat` commit
- `refactor` - commits that rewrite/restructure your code, however do not change any API or UI behaviour
  - `perf` - commits that are special `refactor` commits, which improve performance
- `style` - commits that do not affect the meaning (white-space, formatting, missing semi-colons, etc)
- `test` - commits that add missing tests or correcting existing tests
- `docs` - commits, that affect documentation only
- `build` - commits that affect build components like build tool, ci pipeline, dependencies, project version, etc.
- `ops` - commits that affect operational components like infrastructure, deployment, backup, recovery, etc.
- `chore` - miscellaneous commits e.g. modifying .gitignore

### Examples

- ```
  feat: added email notifications for new announcements
  ```
- ```
  feat(job postings): added 'Add Job' button
  ```
- ```
  fix: prevent creating announcement for empty content
  ```
- ```
  fix(newsletters): resolved issue where newsletter images were not loading
  ```
- ```
  refactor(auth): restructured authentication flow for better maintainability
  ```
- ```
  perf: improved job listing load time by implementing pagination
  ```
- ```
  perf(events): optimized RSVP list rendering to reduce re-renders
  ```
- ```
  style(ui): updated button colors to match brand guidelines
  ```
- ```
  style(typography): fixed inconsistent font sizes in event details page
  ```
- ```
  test(auth): added unit tests for login and registration functions
  ```
- ```
  docs(readme): updated project setup instructions
  ```
- ```
  docs: added documentation for new job postings API endpoint
  ```
- ```
  build: upgraded Firebase SDK to latest version
  ```
- ```
  ops: implemented Firestore backup strategy for alumni data
  ```
- ```
  chore(gitignore): ignored .env files for security reasons
  ```
- ```
  chore: formatted code with Prettier
  ```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
