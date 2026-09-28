import './App.css'

const featuredCharacters = [
  {
    name: 'Aelira Moonbrook',
    species: 'Half-Elf',
    className: 'Ranger',
    summary:
      'A borderland scout who maps forgotten roads and keeps watch over ruined watchtowers.',
  },
  {
    name: 'Bram Ironvale',
    species: 'Dwarf',
    className: 'Cleric',
    summary:
      'A traveling shrine-keeper carrying records of lost clans and battlefield oaths.',
  },
  {
    name: 'Nyx Emberquill',
    species: 'Tiefling',
    className: 'Wizard',
    summary:
      'An archive mage who studies cursed manuscripts and catalogues magical anomalies.',
  },
]

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="D&D Character Codex home">
          <span className="brand-mark">D20</span>
          <span>D&amp;D Character Codex</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#characters">Characters</a>
          <a href="#add-character">Add Character</a>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <p className="eyebrow">Adventurer's Archive</p>
            <h1>D&amp;D Character Codex</h1>
            <p className="hero-text">
              A fantasy character encyclopedia for browsing heroes, rivals,
              allies, and mysterious figures from original campaigns.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a className="button primary-button" href="#characters">
                Browse Characters
              </a>
              <a className="button secondary-button" href="#add-character">
                Add New Entry
              </a>
            </div>
          </div>

          <aside className="archive-note" aria-label="Project specification">
            <h2>Project Spec</h2>
            <p>
              D&amp;D Character Codex stores character records in a cloud database
              and will allow users to create, read, update, and delete entries.
            </p>
            <dl>
              <div>
                <dt>Main Data</dt>
                <dd>Character</dd>
              </div>
              <div>
                <dt>Current Stage</dt>
                <dd>Layout and navigation</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="content-section" id="characters">
          <div className="section-heading">
            <p className="eyebrow">Featured Records</p>
            <h2>Characters in the Codex</h2>
            <p>
              These are placeholder entries for now. In the next stages, this
              section will read real records from Supabase.
            </p>
          </div>

          <div className="character-grid">
            {featuredCharacters.map((character) => (
              <article className="character-card" key={character.name}>
                <div className="portrait-placeholder" aria-hidden="true">
                  {character.name.charAt(0)}
                </div>
                <div>
                  <p className="card-kicker">
                    {character.species} {character.className}
                  </p>
                  <h3>{character.name}</h3>
                  <p>{character.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section form-preview" id="add-character">
          <div className="section-heading">
            <p className="eyebrow">Coming Next</p>
            <h2>Add Character</h2>
            <p>
              This area will become the character creation form once the
              database connection is ready.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
