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

function getFriendlySaveError(errorMessage) {
  if (errorMessage.includes('row-level security')) {
    return 'Supabase blocked this save because write access is not enabled yet. Run the demo RLS policy SQL, then try again.'
  }

  return errorMessage
}

function characterToForm(character) {
  return {
    name: character.name || '',
    species: character.species || '',
    class: character.class || '',
    alignment: character.alignment || '',
    background: character.background || '',
    biography: character.biography || '',
    abilities: character.abilities || '',
    affiliation: character.affiliation || '',
    status: character.status || '',
    image_url: character.image_url || '',
    notes: character.notes || '',
  }
}

const emptyCharacterForm = {
  name: '',
  species: '',
  class: '',
  alignment: '',
  background: '',
  biography: '',
  abilities: '',
  affiliation: '',
  status: '',
  image_url: '',
  notes: '',
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
  const [characterForm, setCharacterForm] = useState(emptyCharacterForm)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(emptyCharacterForm)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  function updateCharacterForm(fieldName, value) {
    setCharacterForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function updateEditForm(fieldName, value) {
    setEditForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function startEditing(character) {
    setEditForm(characterToForm(character))
    setEditError('')
    setEditSuccess('')
    setIsEditing(true)
  }

  async function handleUpdateCharacter(event) {
    event.preventDefault()
    setEditError('')
    setEditSuccess('')

    if (!selectedCharacter?.id) {
      setEditError('Select a saved Supabase character before editing.')
      return
    }

    const trimmedCharacter = Object.fromEntries(
      Object.entries(editForm).map(([key, value]) => [key, value.trim()]),
    )

    if (!trimmedCharacter.name || !trimmedCharacter.species || !trimmedCharacter.class) {
      setEditError('Name, species, and class are required.')
      return
    }

    setIsUpdating(true)

    const { data, error } = await supabase
      .from('characters')
      .update(trimmedCharacter)
      .eq('id', selectedCharacter.id)
      .select('*')
      .single()

    if (error) {
      setEditError(getFriendlySaveError(error.message))
    } else {
      setCharacters((currentCharacters) =>
        currentCharacters.map((character) =>
          character.id === data.id ? data : character,
        ),
      )
      setSelectedCharacter(data)
      setEditSuccess(`${data.name} was updated.`)
      setIsEditing(false)
    }

    setIsUpdating(false)
  }

  async function handleDeleteCharacter() {
    setEditError('')
    setEditSuccess('')

    if (!selectedCharacter?.id) {
      setEditError('Select a saved Supabase character before deleting.')
      return
    }

    const confirmed = window.confirm(
      `Delete ${selectedCharacter.name}? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', selectedCharacter.id)

    if (error) {
      setEditError(getFriendlySaveError(error.message))
    } else {
      setCharacters((currentCharacters) =>
        currentCharacters.filter((character) => character.id !== selectedCharacter.id),
      )
      setSelectedCharacter(null)
      setIsEditing(false)
      setEditSuccess(`${selectedCharacter.name} was deleted.`)
    }

    setIsDeleting(false)
  }

  async function handleAddCharacter(event) {
    event.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!isSupabaseConfigured) {
      setFormError('Supabase is not configured. Add your .env values first.')
      return
    }

    const trimmedCharacter = Object.fromEntries(
      Object.entries(characterForm).map(([key, value]) => [key, value.trim()]),
    )

    if (!trimmedCharacter.name || !trimmedCharacter.species || !trimmedCharacter.class) {
      setFormError('Name, species, and class are required.')
      return
    }

    setIsSaving(true)

    const { data, error } = await supabase
      .from('characters')
      .insert(trimmedCharacter)
      .select('*')
      .single()

    if (error) {
      setFormError(getFriendlySaveError(error.message))
    } else {
      setCharacters((currentCharacters) => [data, ...currentCharacters])
      setSelectedCharacter(data)
      setSearchTerm('')
      setClassFilter('all')
      setSpeciesFilter('all')
      setCharacterForm(emptyCharacterForm)
      setFormSuccess(`${data.name} was added to the codex.`)
      window.location.hash = 'character-details'
    }

    setIsSaving(false)
  }

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
                <dd>Add character form</dd>
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

                <div className="detail-actions">
                  <button
                    className="button secondary-button"
                    type="button"
                    onClick={() => startEditing(selectedCharacter)}
                  >
                    Edit Character
                  </button>
                  <button
                    className="button danger-button"
                    type="button"
                    onClick={handleDeleteCharacter}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Character'}
                  </button>
                </div>

                {editError && (
                  <div className="form-message error-message" role="alert">
                    {editError}
                  </div>
                )}

                {editSuccess && (
                  <div className="form-message success-message" role="status">
                    {editSuccess}
                  </div>
                )}

                {isEditing ? (
                  <form className="character-form edit-form" onSubmit={handleUpdateCharacter}>
                    <label>
                      <span>Name *</span>
                      <input
                        value={editForm.name}
                        onChange={(event) => updateEditForm('name', event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      <span>Species *</span>
                      <input
                        value={editForm.species}
                        onChange={(event) => updateEditForm('species', event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      <span>Class *</span>
                      <input
                        value={editForm.class}
                        onChange={(event) => updateEditForm('class', event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      <span>Alignment</span>
                      <input
                        value={editForm.alignment}
                        onChange={(event) => updateEditForm('alignment', event.target.value)}
                      />
                    </label>

                    <label>
                      <span>Background</span>
                      <input
                        value={editForm.background}
                        onChange={(event) => updateEditForm('background', event.target.value)}
                      />
                    </label>

                    <label>
                      <span>Affiliation</span>
                      <input
                        value={editForm.affiliation}
                        onChange={(event) => updateEditForm('affiliation', event.target.value)}
                      />
                    </label>

                    <label>
                      <span>Status</span>
                      <input
                        value={editForm.status}
                        onChange={(event) => updateEditForm('status', event.target.value)}
                      />
                    </label>

                    <label>
                      <span>Image URL</span>
                      <input
                        type="url"
                        value={editForm.image_url}
                        onChange={(event) => updateEditForm('image_url', event.target.value)}
                      />
                    </label>

                    <label className="full-width-field">
                      <span>Biography</span>
                      <textarea
                        value={editForm.biography}
                        onChange={(event) => updateEditForm('biography', event.target.value)}
                        rows="4"
                      />
                    </label>

                    <label className="full-width-field">
                      <span>Abilities</span>
                      <textarea
                        value={editForm.abilities}
                        onChange={(event) => updateEditForm('abilities', event.target.value)}
                        rows="3"
                      />
                    </label>

                    <label className="full-width-field">
                      <span>Notes</span>
                      <textarea
                        value={editForm.notes}
                        onChange={(event) => updateEditForm('notes', event.target.value)}
                        rows="3"
                      />
                    </label>

                    <div className="form-actions full-width-field">
                      <button className="button primary-button" type="submit" disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        className="button secondary-button"
                        type="button"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
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
                )}
              </div>
            </article>
          ) : (
            <div className="empty-state" role="status">
              No character selected yet. Choose View Details on any character
              card to open a full profile record.
            </div>
          )}
        </section>

        <section className="content-section" id="add-character">
          <div className="section-heading">
            <p className="eyebrow">New Record</p>
            <h2>Add Character</h2>
            <p>
              Add an original fantasy character to the Supabase database. Name,
              species, and class are required.
            </p>
          </div>

          <form className="character-form" onSubmit={handleAddCharacter}>
            <label>
              <span>Name *</span>
              <input
                value={characterForm.name}
                onChange={(event) => updateCharacterForm('name', event.target.value)}
                placeholder="Example: Mara Thornwake"
                required
              />
            </label>

            <label>
              <span>Species *</span>
              <input
                value={characterForm.species}
                onChange={(event) => updateCharacterForm('species', event.target.value)}
                placeholder="Example: Human"
                required
              />
            </label>

            <label>
              <span>Class *</span>
              <input
                value={characterForm.class}
                onChange={(event) => updateCharacterForm('class', event.target.value)}
                placeholder="Example: Bard"
                required
              />
            </label>

            <label>
              <span>Alignment</span>
              <input
                value={characterForm.alignment}
                onChange={(event) => updateCharacterForm('alignment', event.target.value)}
                placeholder="Example: Chaotic Good"
              />
            </label>

            <label>
              <span>Background</span>
              <input
                value={characterForm.background}
                onChange={(event) => updateCharacterForm('background', event.target.value)}
                placeholder="Example: Guild artisan"
              />
            </label>

            <label>
              <span>Affiliation</span>
              <input
                value={characterForm.affiliation}
                onChange={(event) => updateCharacterForm('affiliation', event.target.value)}
                placeholder="Example: Lantern Company"
              />
            </label>

            <label>
              <span>Status</span>
              <input
                value={characterForm.status}
                onChange={(event) => updateCharacterForm('status', event.target.value)}
                placeholder="Example: Active"
              />
            </label>

            <label>
              <span>Image URL</span>
              <input
                type="url"
                value={characterForm.image_url}
                onChange={(event) => updateCharacterForm('image_url', event.target.value)}
                placeholder="https://example.com/portrait.jpg"
              />
            </label>

            <label className="full-width-field">
              <span>Biography</span>
              <textarea
                value={characterForm.biography}
                onChange={(event) => updateCharacterForm('biography', event.target.value)}
                placeholder="Briefly describe the character's history."
                rows="4"
              />
            </label>

            <label className="full-width-field">
              <span>Abilities</span>
              <textarea
                value={characterForm.abilities}
                onChange={(event) => updateCharacterForm('abilities', event.target.value)}
                placeholder="List specialties, abilities, or signature skills."
                rows="3"
              />
            </label>

            <label className="full-width-field">
              <span>Notes</span>
              <textarea
                value={characterForm.notes}
                onChange={(event) => updateCharacterForm('notes', event.target.value)}
                placeholder="Any extra notes for this codex entry."
                rows="3"
              />
            </label>

            <div className="form-actions full-width-field">
              <button className="button primary-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Character'}
              </button>
            </div>

            {formError && (
              <div className="form-message error-message full-width-field" role="alert">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="form-message success-message full-width-field" role="status">
                {formSuccess}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
