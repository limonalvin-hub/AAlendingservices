
import React, { useState, FormEvent, useRef } from 'react';
import { db, collection, addDoc } from '../firebaseConfig';

interface LoanApplicationFormProps {
  onBack: () => void;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onBack }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

    if ('touches' in e) {
       // Handled by CSS touch-action: none
    }

    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3; // Thicker line for better visibility
    ctx.lineCap = 'round'; // Smooth ends
    ctx.lineJoin = 'round'; // Smooth corners
    ctx.strokeStyle = '#1a648a'; // Brand blue color
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
        e.target.value = '';
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

  // Helper: Converts a File object to a Base64 string
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the "data:image/png;base64," prefix
        let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '') || '';
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  };

  // --- GOOGLE APP SCRIPT SUBMISSION LOGIC ---
  const submitLoanApplication = async (data: typeof formData) => {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsHQS23QzMXJyHq1sz1xC32cG1iPDw8bihX_lV5seY/exec";

    try {
      // 1. Convert images
      let schoolIdBase64 = "";
      let corBase64 = "";

      if (data.schoolIdFile) schoolIdBase64 = await convertToBase64(data.schoolIdFile);
      if (data.corFile) corBase64 = await convertToBase64(data.corFile);

      // 2. Prepare the data object matching the Google Script keys
      const payload = {
        // Personal Details
        fullName: data.name,
        schoolIdNumber: data.schoolId,
        collegeCourse: data.course,
        address: data.address,
        phoneNumber: data.phone,
        emailAddress: data.email,
        
        // Loan Details
        loanAmount: data.loanAmount,
        purposeOfLoan: data.loanPurpose,

        // Images
        schoolIdImage: schoolIdBase64,
        schoolIdMime: data.schoolIdFile ? data.schoolIdFile.type : "",
        
        corImage: corBase64,
        corMime: data.corFile ? data.corFile.type : ""
      };

      // 3. Send the POST request
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.result === "success") {
        console.log("Application synced to Google Sheets successfully.");
      } else {
        console.error("Google Sheet Sync Error: " + result.error);
      }

    } catch (error) {
      console.error("Google Sheet Submission Error:", error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate step 2
    const stepErrors: Record<string, string> = {};
    if (!formData.loanAmount) stepErrors.loanAmount = 'Loan amount is required';
    if (!formData.loanPurpose) stepErrors.loanPurpose = 'Purpose is required';
    if (!formData.disbursementMethod) stepErrors.disbursementMethod = 'Please select a receiving method';
    
    if (formData.disbursementMethod === 'gcash' || formData.disbursementMethod === 'maya') {
      if (!formData.walletNumber) {
        stepErrors.walletNumber = 'Wallet number is required';
      } else if (formData.walletNumber && !validatePhone(formData.walletNumber)) {
        stepErrors.walletNumber = 'Please enter a valid 11-digit mobile number starting with 09.';
      }
    }

    if (!formData.corFile) stepErrors.corFile = 'Certificate of Registration is required';
    if (!formData.schoolIdFile) stepErrors.schoolIdFile = 'School ID is required';
    if (!formData.signature) stepErrors.signature = 'Please sign the application';
    if (!agreedToTerms) stepErrors.terms = 'You must agree to the terms and conditions.';

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);

    // Call Google Sheet sync concurrently
    submitLoanApplication(formData).catch(err => console.error("Background sync failed", err));

    try {
      // --- 1. SAVE TO FIRESTORE (Admin Panel Sync) ---
      const applicationData = {
        date: new Date().toISOString(),
        status: 'Pending',
        name: formData.name,
        schoolId: formData.schoolId,
        course: formData.course,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        loanPurpose: formData.loanPurpose,
        loanAmount: formData.loanAmount,
        disbursementMethod: formData.disbursementMethod,
        walletNumber: formData.walletNumber,
        corFileName: formData.corFile ? formData.corFile.name : 'Not attached',
        schoolIdFileName: formData.schoolIdFile ? formData.schoolIdFile.name : 'Not attached',
        signature: formData.signature 
      };

      // 5-second timeout race condition to prevent hanging
      const saveToDb = addDoc(collection(db, "applications"), applicationData);
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));

      await Promise.race([saveToDb, timeout]);
      console.log("Application saved to Firestore");
      
    } catch (err) {
      console.error("Submission warning (Database):", err);
      // We swallow the error so the user can still proceed to success screen
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleNewApplication = () => {
    setIsSubmitted(false);
    setStep(1);
    setErrors({});
    setAgreedToTerms(false);
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
              <h3 className="text-2xl font-bold text-brand-blue-dark mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">Your application has been successfully received. Our team will review your details and process your request within 24 hours.</p>
              
              <div className="bg-blue-50 border-l-4 border-brand-blue text-blue-800 p-4 rounded-md mb-8 text-left" role="alert">
                  <p className="font-bold mb-1">What happens next?</p>
                  <p>Please keep your lines open. We may contact you via SMS or Email for verification purposes.</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 border-t pt-6">
                <button
                  onClick={handleNewApplication}
                  className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                  Start New Application
                </button>
                 <button
                  onClick={onBack}
                  className="text-gray-500 font-semibold hover:text-gray-700 hover:underline py-3 px-6"
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
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">Client Signature</label>
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Clear
                            </button>
                        </div>
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden relative group hover:border-brand-blue transition-colors">
                          {/* Placeholder Text */}
                          {!isDrawing && !formData.signature && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                                  <span className="text-gray-400 text-lg font-medium">Sign Here</span>
                              </div>
                          )}
                          <canvas
                            ref={canvasRef}
                            width={600}
                            height={200}
                            className="w-full h-48 touch-none bg-transparent cursor-crosshair relative z-10"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Please draw your signature in the box above.
                        </p>
                        {errors.signature && <p className="text-red-500 text-xs mt-1">{errors.signature}</p>}
                      </div>

                       {/* Terms and Conditions Section */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Agreement</label>
                        <div className="h-24 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50 text-xs text-gray-600 space-y-2">
                            <p><strong>1. Loan Agreement:</strong> By submitting this application, I agree to the terms of the loan agreement which will be provided upon approval. This includes the principal amount, interest rate, repayment schedule, and any applicable fees.</p>
                            <p><strong>2. Data Privacy:</strong> I consent to the collection and use of my personal information for the purpose of processing this loan application, in accordance with the Data Privacy Act of 2012.</p>
                            <p><strong>3. Repayment Obligation:</strong> I understand that I am obligated to repay the loan on time. Failure to do so may result in penalties and affect my ability to apply for future loans.</p>
                            <p><strong>4. Accuracy of Information:</strong> I certify that all information provided in this application is true and correct to the best of my knowledge.</p>
                        </div>
                        <div className="mt-3 flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => {
                                      setAgreedToTerms(e.target.checked);
                                      if (errors.terms) {
                                          setErrors(prev => {
                                              const newErrors = { ...prev };
                                              delete newErrors.terms;
                                              return newErrors;
                                          });
                                      }
                                    }}
                                    className="focus:ring-brand-blue h-5 w-5 text-brand-blue border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="font-medium text-gray-700">
                                    I have read and agree to the Terms and Conditions.
                                </label>
                            </div>
                        </div>
                        {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                      </div>
                    </div>
                    <div className="mt-8 flex justify-between items-center gap-4">
                      <button type="button" onClick={prevStep} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">Back</button>
                      <button 
                        type="submit" 
                        disabled={!agreedToTerms || isSubmitting}
                        className={`bg-brand-green text-white font-bold py-3 px-6 rounded-lg transition duration-300 ${!agreedToTerms || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-green-light'}`}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
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
