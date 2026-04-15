import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Upload, AlertTriangle, Droplets, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leakAPI } from '../../services/api';

const ReportLeak = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: '', landmark: '' });
  const [details, setDetails] = useState({
    severity: 'MODERATE',
    category: 'PIPE_BURST',
    flowRate: 'STREAM',
    description: ''
  });

  // Get User Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude })),
        (err) => console.log('Location error:', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setStep(2);
    }
  };

  const submitReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      if (!file) throw new Error("Please capture an image");
      
      formData.append('photo', file);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      formData.append('address', location.address || 'Unknown Address');
      formData.append('landmark', location.landmark);
      formData.append('severity', details.severity);
      formData.append('category', details.category);
      formData.append('flowRate', details.flowRate);
      formData.append('description', details.description);

      await leakAPI.createLeak(formData);
      setStep(4); // Success step
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <AlertTriangle className="h-10 w-10 text-primary-500 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-gray-900">Report a Water Leak</h1>
        <p className="text-gray-500 mt-1">Help us save water by reporting leaks accurately.</p>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-center mt-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm
                ${step >= s ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 ${step > s ? 'bg-primary-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Capture Photo */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Step 1: Capture Evidence</h2>
          
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 bg-blue-50 border-2 border-dashed border-primary-300 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Camera className="h-12 w-12 text-primary-500 mb-3" />
              <span className="font-medium text-primary-700">Take Photo</span>
              <span className="text-xs text-primary-600/70 mt-1">Use device camera</span>
            </button>
            
            <button 
              onClick={() => {
                if(fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <span className="font-medium text-gray-600">Upload Gallery</span>
              <span className="text-xs text-gray-500 mt-1">Choose existing photo</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-6 flex items-center justify-center">
            <Info className="h-3 w-3 mr-1" />
            Photos with GPS metadata are assigned a higher trust score
          </p>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-5 w-5 text-primary-500 mr-2" />
            Step 2: Confirm Location
          </h2>

          <div className="space-y-4">
            {previewUrl && (
              <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setStep(1)}
                  className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs"
                >
                  Change Photo
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                className="input"
                placeholder="Where is the leak?"
                value={location.address}
                onChange={e => setLocation({...location, address: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="Near the post office..."
                value={location.landmark}
                onChange={e => setLocation({...location, landmark: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="btn-secondary w-full">Back</button>
              <button 
                onClick={() => setStep(3)} 
                className="btn-primary w-full disabled:opacity-50"
                disabled={!location.lat && !location.address}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Leak Details */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Droplets className="h-5 w-5 text-primary-500 mr-2" />
            Step 3: Leak Intensity
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['MINOR', 'MODERATE', 'SEVERE', 'CRITICAL'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setDetails({...details, severity: sev})}
                    className={`py-2 px-3 border rounded-lg text-sm font-medium transition-all
                      ${details.severity === sev 
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Water Flow Rate</label>
              <select
                className="input"
                value={details.flowRate}
                onChange={(e) => setDetails({...details, flowRate: e.target.value})}
              >
                <option value="DRIP">Drip (Slow drops)</option>
                <option value="STREAM">Stream (Continuous flow)</option>
                <option value="GUSH">Gush (High pressure spray)</option>
                <option value="FLOOD">Flood (Area is pooling with water)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="input"
                value={details.category}
                onChange={(e) => setDetails({...details, category: e.target.value})}
              >
                <option value="PIPE_BURST">Main Pipe Burst</option>
                <option value="TAP_LEAK">Public Tap / Valve Leak</option>
                <option value="UNDERGROUND">Underground Seepage</option>
                <option value="METER_LEAK">Water Meter Leak</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                className="input min-h-[100px]"
                placeholder="Any other details to help the maintenance crew?"
                value={details.description}
                onChange={(e) => setDetails({...details, description: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setStep(2)} className="btn-secondary w-full border-gray-200 border bg-white hover:bg-gray-50">Back</button>
              <button 
                onClick={submitReport} 
                className="btn-primary w-full shadow-lg shadow-primary-500/30 font-semibold"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center animate-in zoom-in duration-300">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Thank you for helping save water. You've earned <span className="font-bold text-primary-600">+10 Points</span>!
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="btn-secondary">Go to Dashboard</button>
            <button onClick={() => {
              setStep(1);
              setFile(null);
              setPreviewUrl(null);
            }} className="btn-primary">Report Another</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportLeak;
