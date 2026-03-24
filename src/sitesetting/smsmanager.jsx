import React, { useState, useEffect } from 'react';
import apiManager from '../apimanger'; 
import { toast } from 'react-toastify';

const SmsSettings = () => {
  const [settings, setSettings] = useState({
    admission: 0,
    fee_collect: 0,
    admission_text: '',
    fee_collect_text: ''
  });
  const [loading, setLoading] = useState(true);
const [admissionPoccessing, setAdmissionProcessing] = useState(false);
const [feeProcessing, setFeeProcessing] = useState(false);
  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiManager.get('/sms/settings');
      if (res) setSettings(res);
      setLoading(false);
      setAdmissionProcessing(false);
        setFeeProcessing(false);
    } catch (err) {
      toast.error("Settings load hote somossya hoyeche");
      setLoading(false);
    }
  };

  const handleUpdate = async (type) => {
    try {
      const payload = {
        type: type,
        status: settings[type],
        template: settings[`${type}_text`]
      };
        if(type === 'admission') setAdmissionProcessing(true);
        else setFeeProcessing(true);

      await apiManager.post('/sms/update-settings', payload);
      toast.success(`${type.replace('_', ' ')} updated successfully!`);
      fetchSettings();
    } catch (err) {
      toast.error("Update fail hoyeche");
    }
  };

  const insertVariable = (type, variable) => {
    setSettings({
      ...settings,
      [`${type}_text`]: (settings[`${type}_text`] || '') + variable
    });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>Loading...</div>;

  // Reusable Styles
  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid #eee'
  };

  const btnStyle = {
    padding: '10px 20px',
    backgroundColor: '#2d3436',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  };

  const badgeStyle = {
    padding: '4px 10px',
    backgroundColor: '#e1f5fe',
    border: '1px solid #b3e5fc',
    borderRadius: '5px',
    fontSize: '12px',
    cursor: 'pointer',
    marginRight: '8px',
    color: '#0277bd'
  };

  return (
    <main className="main-container">
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ fontSize: '28px', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '30px' }}>
          SMS Template Settings
        </h2>

       {['admission', 'fee_collect'].map((type) => {
  // Type onujayi variable list define kora
  const admissionVars = ['${studentName}', '${studentId}', '${fatherName}', '${roll}', '${jamat}', '${bivag}', '${date}'];
  const feeVars = ['${studentName}', '${amount}', '${remain}', '${date}'];
  
  const currentVars = type === 'admission' ? admissionVars : feeVars;

  return (
    <div key={type} style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, textTransform: 'capitalize', color: '#444' }}>
          {type.replace('_', ' ')} Notification
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: settings[type] ? '#2ecc71' : '#e74c3c' }}>
            {settings[type] ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <input 
            type="checkbox" 
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            checked={settings[type] === 1}
            onChange={(e) => setSettings({...settings, [type]: e.target.checked ? 1 : 0})}
          />
        </div>
      </div>

      {/* Variable Section - Now Dynamic */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#666', letterSpacing: '0.5px' }}>
          CLICK TO ADD VARIABLE:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {currentVars.map((v) => (
         
         
         <button 
              key={v} 
              type="button"
              onClick={() => insertVariable(type, v)} 
              style={badgeStyle}
              title={`Insert ${v}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <textarea
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          minHeight: '130px',
          fontSize: '15px',
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          lineHeight: '1.5',
          backgroundColor: '#fff'
        }}
        value={settings[`${type}_text`] || ''}
        onChange={(e) => setSettings({...settings, [`${type}_text`]: e.target.value})}
        placeholder={`Enter ${type.replace('_', ' ')} message template...`}
      />
{ /*added save button section with proccing state */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
      
      {{admission: admissionPoccessing, fee_collect: feeProcessing}[type] ? (
        <button 
          disabled
          style={{ ...btnStyle, backgroundColor: '#95a5a6', cursor: 'not-allowed' } 
        }>
          Saving...
        </button>
      ) : ( 
        <button 
          onClick={() => handleUpdate(type)}
          style={btnStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#000'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#2d3436'}
        >
          Save {type === 'admission' ? 'Admission' : 'Payment'} Template
        </button>
        )}
      </div>
    </div>
  );
})}
      </div>
    </main>
  );
};

export default SmsSettings;