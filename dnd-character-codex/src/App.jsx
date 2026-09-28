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

function getUniqueOptions(characters, fieldName) {
  return [...new Set(characters.map((character) => character[fieldName]).filter(Boolean))].sort()
}

function getDisplayValue(value) {
  return value || 'Not recorded yet'
}

function App() {
  const [characters, setCharacters] = useState(featuredCharacters)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [loadError, setLoadError] = useState(
    isSupabaseConfigured
      ? ''
      : 'Add your Supabase URL and anon key to .env to load database records.',
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  const classOptions = getUniqueOptions(characters, 'class')
  const speciesOptions = getUniqueOptions(characters, 'species')
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredCharacters = characters.filter((character) => {
    const matchesSearch = character.name
      .toLowerCase()
      .includes(normalizedSearchTerm)
    const matchesClass = classFilter === 'all' || character.class === classFilter
    const matchesSpecies =
      speciesFilter === 'all' || character.species === speciesFilter

    return matchesSearch && matchesClass && matchesSpecies
  })

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
                <dd>Character details</dd>
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
              are configured. Search by character name, or narrow the archive
              by class and species.
            </p>
          </div>

          <div className="data-status" role="status">
            {isLoading && 'Loading character records...'}
            {!isLoading && !loadError && 'Showing records from Supabase.'}
            {!isLoading && loadError}
          </div>

          <form className="character-controls" aria-label="Character filters">
            <label>
              <span>Search by name</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Try Aelira or Bram"
              />
            </label>

            <label>
              <span>Class</span>
              <select
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
              >
                <option value="all">All classes</option>
                {classOptions.map((className) => (
                  <option value={className} key={className}>
                    {className}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Species</span>
              <select
                value={speciesFilter}
                onChange={(event) => setSpeciesFilter(event.target.value)}
              >
                <option value="all">All species</option>
                {speciesOptions.map((species) => (
                  <option value={species} key={species}>
                    {species}
                  </option>
                ))}
              </select>
            </label>
          </form>

          <p className="results-summary" aria-live="polite">
            Showing {filteredCharacters.length} of {characters.length} character
            records.
          </p>

          <div className="character-grid">
            {filteredCharacters.map((character) => (
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
                  <a
                    className="text-button"
                    href="#character-details"
                    onClick={() => setSelectedCharacter(character)}
                  >
                    View Details
                  </a>
                </div>
              </article>
            ))}
          </div>

          {filteredCharacters.length === 0 && (
            <div className="empty-state" role="status">
              No characters match those filters. Try clearing the search or
              choosing a different class or species.
            </div>
          )}
        </section>

        <section className="content-section" id="character-details">
          <div className="section-heading">
            <p className="eyebrow">Profile Record</p>
            <h2>Character Details</h2>
            <p>
              Select a character from the archive to view the full database
              record for that profile.
            </p>
          </div>

          {selectedCharacter ? (
            <article className="detail-panel">
              <div className="detail-portrait">
                {selectedCharacter.image_url ? (
                  <img
                    src={selectedCharacter.image_url}
                    alt={`${selectedCharacter.name} portrait`}
                  />
                ) : (
                  <span aria-hidden="true">
                    {selectedCharacter.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="detail-content">
                <p className="card-kicker">
                  {getDisplayValue(selectedCharacter.species)}{' '}
                  {getDisplayValue(selectedCharacter.class)}
                </p>
                <h3>{selectedCharacter.name}</h3>
                <p className="detail-biography">
                  {getDisplayValue(selectedCharacter.biography)}
                </p>

                <dl className="detail-list">
                  <div>
                    <dt>Alignment</dt>
                    <dd>{getDisplayValue(selectedCharacter.alignment)}</dd>
                  </div>
                  <div>
                    <dt>Background</dt>
                    <dd>{getDisplayValue(selectedCharacter.background)}</dd>
                  </div>
                  <div>
                    <dt>Abilities</dt>
                    <dd>{getDisplayValue(selectedCharacter.abilities)}</dd>
                  </div>
                  <div>
                    <dt>Affiliation</dt>
                    <dd>{getDisplayValue(selectedCharacter.affiliation)}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{getDisplayValue(selectedCharacter.status)}</dd>
                  </div>
                  <div>
                    <dt>Image URL</dt>
                    <dd>{getDisplayValue(selectedCharacter.image_url)}</dd>
                  </div>
                  <div>
                    <dt>Notes</dt>
                    <dd>{getDisplayValue(selectedCharacter.notes)}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ) : (
            <div className="empty-state" role="status">
              No character selected yet. Choose View Details on any character
              card to open a full profile record.
            </div>
          )}
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
