
import React, { useState, FormEvent, useRef } from 'react';

interface LoanApplicationFormProps {
  onBack: () => void;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onBack }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    schoolId: '',
    course: '',
    address: '',
    phone: '',
    email: '',
    loanPurpose: '',
    loanAmount: '',
    disbursementMethod: '',
    walletNumber: '',
    corFile: null as File | null,
    schoolIdFile: null as File | null,
    signature: '',
  });

  // Signature Canvas Logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling when touching the canvas
    if ('touches' in e) {
       // Handled by CSS touch-action: none, but good practice to be aware
    }

    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setFormData(prev => ({ ...prev, signature: canvasRef.current?.toDataURL() || '' }));
      if (errors.signature) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.signature;
            return newErrors;
        });
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setFormData(prev => ({ ...prev, signature: '' }));
    }
  };

  const validatePhone = (phone: string) => {
    // PH mobile number format: starts with 09 and has 11 digits total
    return /^09\d{9}$/.test(phone);
  };

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Only JPG, PNG, and PDF are allowed.';
    }
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));

    // Real-time validation
    if (name === 'phone' || name === 'walletNumber') {
      if (value && !validatePhone(value)) {
        setErrors(prev => ({ ...prev, [name]: 'Please enter a valid 11-digit mobile number starting with 09.' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      // Clear errors for other fields on change
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      const error = validateFile(file);
      
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
        e.target.value = ''; // Reset file input
        setFormData(prevState => ({ ...prevState, [name]: null }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        setFormData(prevState => ({ ...prevState, [name]: file }));
      }
    }
  };

  const nextStep = () => {
    // Validate step 1
    const stepErrors: Record<string, string> = {};
    if (!formData.name) stepErrors.name = 'Full Name is required';
    if (!formData.schoolId) stepErrors.schoolId = 'School ID is required';
    if (!formData.course) stepErrors.course = 'Course is required';
    if (!formData.address) stepErrors.address = 'Address is required';
    if (!formData.phone) {
      stepErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      stepErrors.phone = 'Please enter a valid 11-digit mobile number starting with 09.';
    }
    if (!formData.email) stepErrors.email = 'Email is required';

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate step 2
    const stepErrors: Record<string, string> = {};
    if (!formData.loanAmount) stepErrors.loanAmount = 'Loan amount is required';
    if (!formData.loanPurpose) stepErrors.loanPurpose = 'Purpose is required';
    if (!formData.disbursementMethod) stepErrors.disbursementMethod = 'Please select a receiving method';
    
    if (formData.disbursementMethod === 'gcash' || formData.disbursementMethod === 'maya') {
      if (!formData.walletNumber) {
        stepErrors.walletNumber = 'Wallet number is required';
      } else if (!validatePhone(formData.walletNumber)) {
        stepErrors.walletNumber = 'Please enter a valid 11-digit mobile number starting with 09.';
      }
    }

    if (!formData.corFile) stepErrors.corFile = 'Certificate of Registration is required';
    if (!formData.schoolIdFile) stepErrors.schoolIdFile = 'School ID is required';
    if (!formData.signature) stepErrors.signature = 'Please sign the application';

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    // --- SIMULATE BACKEND SUBMISSION (For Admin Panel Demo) ---
    // We save the application to localStorage so the Admin Panel can read it.
    
    const newApplication = {
      id: Date.now().toString(), // simple unique ID
      date: new Date().toISOString(),
      status: 'Pending',
      ...formData,
      // We can't save File objects to localStorage easily, so we just save names for demo
      corFileName: formData.corFile ? formData.corFile.name : 'Not attached',
      schoolIdFileName: formData.schoolIdFile ? formData.schoolIdFile.name : 'Not attached',
      // Removing actual file objects from storage payload
      corFile: undefined,
      schoolIdFile: undefined
    };

    try {
      const existingApps = JSON.parse(localStorage.getItem('loanApplications') || '[]');
      localStorage.setItem('loanApplications', JSON.stringify([newApplication, ...existingApps]));
    } catch (err) {
      console.error("Could not save to local storage", err);
    }

    // --- EMAIL GENERATION (Existing Logic) ---
    
    const recipient = 'aalendingservices@gmail.com';
    const subject = `New Loan Application: ${formData.name} (ID: ${newApplication.id})`;
    
    let disbursementDetails = '';
    if (formData.disbursementMethod === 'gcash') {
      disbursementDetails = `Method: GCash\nE-Wallet Number: ${formData.walletNumber}`;
    } else if (formData.disbursementMethod === 'maya') {
      disbursementDetails = `Method: Maya\nE-Wallet Number: ${formData.walletNumber}`;
    } else {
      disbursementDetails = `Method: Claim In Person`;
    }

    const body = `
A new loan application has been submitted with the following details:

--- Personal Information ---
Full Name: ${formData.name}
School ID Number: ${formData.schoolId}
College Course: ${formData.course}
Address: ${formData.address}
Phone Number: ${formData.phone}
Email Address: ${formData.email}

--- Loan Details ---
Loan Amount Requested: ₱${formData.loanAmount}
Purpose of Loan: ${formData.loanPurpose}

--- Receiving Options ---
${disbursementDetails}

--- Certification ---
Signed: Yes (Electronically Signed via App)
Date: ${new Date().toLocaleDateString()}

---
IMPORTANT: Please attach the required files before sending:
1. Certificate of Registration (COR)
2. School ID (Front & Back)
    `;

    // Encode the subject and body for the URL
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the user's email client
    window.location.href = mailtoLink;

    setIsSubmitted(true);
  };

  const handleNewApplication = () => {
    setIsSubmitted(false);
    setStep(1);
    setErrors({});
    setFormData({
      name: '',
      schoolId: '',
      course: '',
      address: '',
      phone: '',
      email: '',
      loanPurpose: '',
      loanAmount: '',
      disbursementMethod: '',
      walletNumber: '',
      corFile: null as File | null,
      schoolIdFile: null as File | null,
      signature: '',
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex items-center">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg">
          {isSubmitted ? (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-up">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-brand-blue-dark mb-2">Almost Done! Please Send Your Application</h3>
              <p className="text-gray-600 mb-6">We've prepared your application. Please verify the details in your email client and click 'Send' to complete your application.</p>
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md" role="alert">
                  <p className="font-bold">Important:</p>
                  <p>Don't forget to attach your Certificate of Registration (COR) and School ID picture before sending the email.</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  onClick={handleNewApplication}
                  className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-3 px-6 rounded-lg transition duration-300 w-full sm:w-auto"
                >
                  New Application
                </button>
                 <button
                  onClick={onBack}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 w-full sm:w-auto"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-brand-blue-dark">Loan Application Form</h2>
                <p className="text-gray-600 mt-2">Step {step} of 2: {step === 1 ? 'Personal Information' : 'Loan Details & Documents'}</p>
              </div>
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div>
                    <div className="space-y-4">
                      {/* Personal Info Fields */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-gray-50" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700">School ID Number</label>
                        <input type="text" name="schoolId" id="schoolId" value={formData.schoolId} onChange={handleChange} required className="mt-1 block w-full p-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-gray-50" />
                        {errors.schoolId && <p className="text-red-500 text-xs mt-1">{errors.schoolId}</p>}
                      </div>
                      <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700">College Course</label>
                        <input type="text" name="course" id="course" value={formData.course} onChange={handleChange} required className="mt-1 block w-full p-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-gray-50" placeholder="e.g., Bachelor of Science in Information Technology"/>
                        {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full p-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-gray-50" />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={`mt-1 block w-full p-3 text-base border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-gray-50`} placeholder="09XXXXXXXXX" />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-gray-50" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end items-center gap-4">
                      <button type="button" onClick={onBack} className="text-gray-600 hover:text-brand-blue transition font-medium py-2 px-4">Back to Home</button>
                      <button type="button" onClick={nextStep} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300">Next</button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <div className="space-y-4">
                       {/* Loan Details & Documents */}
                      <div>
                        <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">Loan Amount (₱)</label>
                        <input type="number" name="loanAmount" id="loanAmount" value={formData.loanAmount} onChange={handleChange} placeholder="e.g., 500" required className="mt-1 block w-full p-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-gray-50" />
                        {errors.loanAmount && <p className="text-red-500 text-xs mt-1">{errors.loanAmount}</p>}
                      </div>
                       <div>
                        <label htmlFor="loanPurpose" className="block text-sm font-medium text-gray-700">Purpose of Loan</label>
                        <textarea name="loanPurpose" id="loanPurpose" value={formData.loanPurpose} onChange={handleChange} required rows={3} className="mt-1 block w-full p-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-gray-50" placeholder="e.g., For thesis project materials..."></textarea>
                        {errors.loanPurpose && <p className="text-red-500 text-xs mt-1">{errors.loanPurpose}</p>}
                      </div>
                      
                      {/* Disbursement Options */}
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <label className="block text-base font-medium text-gray-700 mb-2">Preferred Method of Receiving Funds</label>
                        {errors.disbursementMethod && <p className="text-red-500 text-xs mb-2">{errors.disbursementMethod}</p>}
                        <div className="space-y-2">
                          <div className="flex items-center py-2">
                            <input 
                              id="gcash" 
                              name="disbursementMethod" 
                              type="radio" 
                              value="gcash" 
                              checked={formData.disbursementMethod === 'gcash'} 
                              onChange={handleChange} 
                              required
                              className="focus:ring-brand-blue h-5 w-5 text-brand-blue border-gray-300" 
                            />
                            <label htmlFor="gcash" className="ml-3 block text-base font-medium text-gray-700 w-full">GCash</label>
                          </div>
                          <div className="flex items-center py-2">
                            <input 
                              id="maya" 
                              name="disbursementMethod" 
                              type="radio" 
                              value="maya" 
                              checked={formData.disbursementMethod === 'maya'} 
                              onChange={handleChange} 
                              className="focus:ring-brand-blue h-5 w-5 text-brand-blue border-gray-300" 
                            />
                            <label htmlFor="maya" className="ml-3 block text-base font-medium text-gray-700 w-full">Maya</label>
                          </div>
                          <div className="flex items-center py-2">
                            <input 
                              id="in_person" 
                              name="disbursementMethod" 
                              type="radio" 
                              value="in_person" 
                              checked={formData.disbursementMethod === 'in_person'} 
                              onChange={handleChange} 
                              className="focus:ring-brand-blue h-5 w-5 text-brand-blue border-gray-300" 
                            />
                            <label htmlFor="in_person" className="ml-3 block text-base font-medium text-gray-700 w-full">Claim In Person</label>
                          </div>
                        </div>

                        {(formData.disbursementMethod === 'gcash' || formData.disbursementMethod === 'maya') && (
                          <div className="mt-4 animate-fade-in">
                            <label htmlFor="walletNumber" className="block text-sm font-medium text-gray-700">
                              {formData.disbursementMethod === 'gcash' ? 'GCash' : 'Maya'} Number
                            </label>
                            <input 
                              type="tel" 
                              name="walletNumber" 
                              id="walletNumber" 
                              value={formData.walletNumber} 
                              onChange={handleChange} 
                              required 
                              className={`mt-1 block w-full p-3 text-base border ${errors.walletNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-white`}
                              placeholder="09XXXXXXXXX" 
                            />
                            {errors.walletNumber && <p className="text-red-500 text-xs mt-1">{errors.walletNumber}</p>}
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="corFile" className="block text-sm font-medium text-gray-700">Upload Certificate of Registration (COR)</label>
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" name="corFile" id="corFile" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-brand-green hover:file:bg-green-100"/>
                        {formData.corFile && <span className="text-xs text-gray-500 mt-1">Selected: {formData.corFile.name}</span>}
                        {errors.corFile && <p className="text-red-500 text-xs mt-1">{errors.corFile}</p>}
                      </div>
                      <div>
                        <label htmlFor="schoolIdFile" className="block text-sm font-medium text-gray-700">Upload School ID (Front & Back)</label>
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" name="schoolIdFile" id="schoolIdFile" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-brand-green hover:file:bg-green-100"/>
                        {formData.schoolIdFile && <span className="text-xs text-gray-500 mt-1">Selected: {formData.schoolIdFile.name}</span>}
                        {errors.schoolIdFile && <p className="text-red-500 text-xs mt-1">{errors.schoolIdFile}</p>}
                      </div>

                      {/* Client Signature Section */}
                      <div className="border-t border-gray-200 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Signature</label>
                        <div className="bg-white border border-gray-300 rounded-md overflow-hidden relative">
                          <canvas 
                            ref={canvasRef}
                            width={600}
                            height={200}
                            className="w-full h-48 touch-none bg-white cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                          />
                          <button 
                            type="button" 
                            onClick={clearSignature}
                            className="absolute top-2 right-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded border border-gray-300"
                          >
                            Clear
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Please sign in the box above.</p>
                        {errors.signature && <p className="text-red-500 text-xs mt-1">{errors.signature}</p>}
                      </div>

                    </div>
                    <div className="mt-8 flex justify-between items-center gap-4">
                      <button type="button" onClick={prevStep} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">Back</button>
                      <button type="submit" className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-3 px-6 rounded-lg transition duration-300">Submit Application</button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationForm;
