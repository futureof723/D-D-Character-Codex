import { useEffect, useState } from 'react'
import './App.css'
import { isSupabaseConfigured, supabase } from './services/supabaseClient'

const featuredCharacters = [
  {
    name: 'Aelira Moonbrook',
    species: 'Half-Elf',
    class: 'Ranger',
    summary:
      'A borderland scout who maps forgotten roads and keeps watch over ruined watchtowers.',
  },
  {
    name: 'Bram Ironvale',
    species: 'Dwarf',
    class: 'Cleric',
    summary:
      'A traveling shrine-keeper carrying records of lost clans and battlefield oaths.',
  },
  {
    name: 'Nyx Emberquill',
    species: 'Tiefling',
    class: 'Wizard',
    summary:
      'An archive mage who studies cursed manuscripts and catalogues magical anomalies.',
  },
]

function getCharacterSummary(character) {
  return (
    character.biography ||
    character.background ||
    character.notes ||
    'No description has been recorded for this character yet.'
  )
}

function App() {
  const [characters, setCharacters] = useState(featuredCharacters)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [loadError, setLoadError] = useState(
    isSupabaseConfigured
      ? ''
      : 'Add your Supabase URL and anon key to .env to load database records.',
  )

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    async function loadCharacters() {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setLoadError(error.message)
      } else {
        setCharacters(data.length > 0 ? data : featuredCharacters)
        setLoadError('')
      }

      setIsLoading(false)
    }

    loadCharacters()
  }, [])

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
                <dd>Supabase connection</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="content-section" id="characters">
          <div className="section-heading">
            <p className="eyebrow">Featured Records</p>
            <h2>Characters in the Codex</h2>
            <p>
              This section now reads from Supabase when environment variables
              are configured. Sample records remain visible while setup is in
              progress.
            </p>
          </div>

          <div className="data-status" role="status">
            {isLoading && 'Loading character records...'}
            {!isLoading && !loadError && 'Showing records from Supabase.'}
            {!isLoading && loadError}
          </div>

          <div className="character-grid">
            {characters.map((character) => (
              <article className="character-card" key={character.name}>
                <div className="portrait-placeholder" aria-hidden="true">
                  {character.name.charAt(0)}
                </div>
                <div>
                  <p className="card-kicker">
                    {character.species || 'Unknown Species'}{' '}
                    {character.class || 'Unknown Class'}
                  </p>
                  <h3>{character.name}</h3>
                  <p>{character.summary || getCharacterSummary(character)}</p>
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
