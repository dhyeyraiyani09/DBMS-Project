import { useState, useEffect } from 'react';
import * as api from '../services/schemaApi';

function SchemaManager() {
    const [schemas, setSchemas] = useState([]);
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [error, setError] = useState(null);

    // Form states
    const [newSchemaName, setNewSchemaName] = useState('');
    const [newTableName, setNewTableName] = useState('');
    const [colTableId, setColTableId] = useState('');
    const [newCol, setNewCol] = useState({ name: '', data_type: 'INT', is_primary_key: false });
    
    // Index Form states
    const [idxTableId, setIdxTableId] = useState('');
    const [newIdx, setNewIdx] = useState({ name: '', is_unique: false });
    const [idxCols, setIdxCols] = useState([]); // {column_id, seq_in_index}

    // FK Form states
    const [fkTableId, setFkTableId] = useState('');
    const [newFk, setNewFk] = useState({ column_id: '', ref_table_id: '', ref_column_id: '' });

    useEffect(() => {
        loadSchemas();
    }, []);

    const loadSchemas = async () => {
        try {
            const data = await api.getSchemas();
            setSchemas(data);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleCreateSchema = async (e) => {
        e.preventDefault();
        try {
            await api.createSchema({ name: newSchemaName, description: "Educational DB" });
            setNewSchemaName('');
            loadSchemas();
            setError(null);
        } catch (e) {
            setError("Unable to save schema. " + JSON.parse(e.message).detail);
        }
    };

    const loadSchemaDetails = async (id) => {
        try {
            const data = await api.getSchema(id);
            setSelectedSchema(data);
            setError(null);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleCreateTable = async (e) => {
        e.preventDefault();
        if (!selectedSchema) return;
        try {
            await api.createTable(selectedSchema.id, { name: newTableName });
            setNewTableName('');
            loadSchemaDetails(selectedSchema.id);
        } catch (e) {
            setError("Unable to save table. " + JSON.parse(e.message).detail);
        }
    };

    const handleCreateColumn = async (e) => {
        e.preventDefault();
        try {
            await api.createColumn(colTableId, newCol);
            setNewCol({ name: '', data_type: 'INT', is_primary_key: false });
            loadSchemaDetails(selectedSchema.id);
        } catch (e) {
            setError("Unable to save column. " + JSON.parse(e.message).detail);
        }
    };

    const handleCreateFk = async (e) => {
        e.preventDefault();
        try {
            await api.createForeignKey(fkTableId, newFk);
            setNewFk({ column_id: '', ref_table_id: '', ref_column_id: '' });
            loadSchemaDetails(selectedSchema.id);
        } catch (e) {
            setError("Unable to save Foreign Key. " + JSON.parse(e.message).detail);
        }
    };

    const handleCreateIndex = async (e) => {
        e.preventDefault();
        try {
            await api.createIndex(idxTableId, { ...newIdx, columns: idxCols });
            setNewIdx({ name: '', is_unique: false });
            setIdxCols([]);
            loadSchemaDetails(selectedSchema.id);
        } catch (e) {
            setError("Unable to save Index. " + JSON.parse(e.message).detail);
        }
    };

    const addIdxColumn = (colId) => {
        setIdxCols([...idxCols, { column_id: parseInt(colId), seq_in_index: idxCols.length + 1 }]);
    };

    return (
        <div className="schema-manager">
            <h2>Schema Management</h2>
            {error && <div className="error-banner">{error}</div>}
            
            <div className="layout">
                <div className="sidebar">
                    <h3>Schemas</h3>
                    <ul>
                        {schemas.map(s => (
                            <li key={s.id} onClick={() => loadSchemaDetails(s.id)} className={selectedSchema?.id === s.id ? 'active' : ''}>
                                {s.name}
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={handleCreateSchema} className="mini-form">
                        <input value={newSchemaName} onChange={e => setNewSchemaName(e.target.value)} placeholder="New Schema Name" required />
                        <button type="submit">Add Schema</button>
                    </form>
                </div>

                <div className="main-content">
                    {!selectedSchema ? <p>Select a schema to view or manage.</p> : (
                        <div>
                            <h3>Schema: {selectedSchema.name}</h3>
                            
                            <div className="schema-forms">
                                <form onSubmit={handleCreateTable}>
                                    <h4>Add Table</h4>
                                    <input value={newTableName} onChange={e => setNewTableName(e.target.value)} placeholder="Table Name" required />
                                    <button type="submit">Add Table</button>
                                </form>

                                {selectedSchema.tables.length > 0 && (
                                    <>
                                        <form onSubmit={handleCreateColumn}>
                                            <h4>Add Column</h4>
                                            <select value={colTableId} onChange={e => setColTableId(e.target.value)} required>
                                                <option value="">Select Table...</option>
                                                {selectedSchema.tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                            <input value={newCol.name} onChange={e => setNewCol({...newCol, name: e.target.value})} placeholder="Column Name" required />
                                            <select value={newCol.data_type} onChange={e => setNewCol({...newCol, data_type: e.target.value})}>
                                                <option>INT</option>
                                                <option>BIGINT</option>
                                                <option>VARCHAR</option>
                                                <option>TEXT</option>
                                                <option>DATE</option>
                                                <option>DATETIME</option>
                                                <option>DECIMAL</option>
                                                <option>BOOLEAN</option>
                                            </select>
                                            <label><input type="checkbox" checked={newCol.is_primary_key} onChange={e => setNewCol({...newCol, is_primary_key: e.target.checked})} /> PK</label>
                                            <button type="submit">Add Column</button>
                                        </form>

                                        <form onSubmit={handleCreateFk}>
                                            <h4>Add Foreign Key</h4>
                                            <select value={fkTableId} onChange={e => setFkTableId(e.target.value)} required>
                                                <option value="">Source Table...</option>
                                                {selectedSchema.tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                            <input type="number" placeholder="Src Col ID" value={newFk.column_id} onChange={e => setNewFk({...newFk, column_id: parseInt(e.target.value)})} required />
                                            <select value={newFk.ref_table_id} onChange={e => setNewFk({...newFk, ref_table_id: parseInt(e.target.value)})} required>
                                                <option value="">Target Table...</option>
                                                {selectedSchema.tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                            <input type="number" placeholder="Target Col ID" value={newFk.ref_column_id} onChange={e => setNewFk({...newFk, ref_column_id: parseInt(e.target.value)})} required />
                                            <button type="submit">Add FK</button>
                                        </form>

                                        <form onSubmit={handleCreateIndex}>
                                            <h4>Add Index</h4>
                                            <select value={idxTableId} onChange={e => setIdxTableId(e.target.value)} required>
                                                <option value="">Select Table...</option>
                                                {selectedSchema.tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                            <input value={newIdx.name} onChange={e => setNewIdx({...newIdx, name: e.target.value})} placeholder="Index Name (e.g. idx_user)" required />
                                            
                                            <div className="idx-col-builder">
                                                <span>Columns in index ({idxCols.length}):</span>
                                                <select onChange={e => { if(e.target.value) addIdxColumn(e.target.value); e.target.value=''; }}>
                                                    <option value="">Add column to index...</option>
                                                    {idxTableId && selectedSchema.tables.find(t=>t.id==idxTableId)?.columns.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button type="submit" disabled={idxCols.length === 0}>Save Index</button>
                                        </form>
                                    </>
                                )}
                            </div>

                            <hr />
                            
                            <div className="schema-visualization">
                                <h4>Schema Visualization</h4>
                                <div className="tables-grid">
                                    {selectedSchema.tables.map(table => (
                                        <div className="db-table" key={table.id}>
                                            <div className="db-table-header">{table.name} <span>(ID: {table.id})</span></div>
                                            <div className="db-table-body">
                                                {table.columns.map(c => (
                                                    <div key={c.id} className="db-column">
                                                        <span>{c.name} <i>{c.data_type}</i></span>
                                                        <span>
                                                            {c.is_primary_key && <b className="pk">PK</b>}
                                                            {table.foreign_keys.some(fk => fk.column_id === c.id) && <b className="fk">FK</b>}
                                                            <span className="col-id">[ID:{c.id}]</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {table.indexes.length > 0 && (
                                                <div className="db-table-indexes">
                                                    <strong>Indexes:</strong>
                                                    {table.indexes.map(idx => (
                                                        <div key={idx.id} className="db-index">
                                                            {idx.name} ({idx.index_columns.sort((a,b)=>a.seq_in_index - b.seq_in_index).map(ic => {
                                                                const col = table.columns.find(c => c.id === ic.column_id);
                                                                return col ? col.name : '?';
                                                            }).join(', ')})
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SchemaManager;
