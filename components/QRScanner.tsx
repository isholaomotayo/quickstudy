"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  X, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  User, 
  GraduationCap,
  Building,
  DollarSign,
  Clock,
  Phone,
  Mail
} from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete?: (result: any) => void;
}

interface VerificationResult {
  verified: boolean;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    programme?: string;
    department?: string;
    faculty?: string;
  };
  institution: {
    name: string;
    phone?: string;
    email?: string;
  };
  paymentSummary: {
    totalPayments: number;
    paidAmount: number;
    pendingPayments: number;
    failedPayments: number;
  };
  verifiedAt: string;
  message: string;
}

export default function QRScanner({ isOpen, onClose, onVerificationComplete }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsScanning(true);
      
      // Start scanning for QR codes
      setTimeout(() => {
        scanForQRCode();
      }, 1000);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const scanForQRCode = async () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      setTimeout(scanForQRCode, 100);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Get image data for QR code detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use a simple QR detection (in a real implementation, you'd use a QR code library)
      // For now, we'll simulate QR detection by looking for manual input
      
      // Continue scanning if still active
      if (isScanning && !verificationResult) {
        setTimeout(scanForQRCode, 100);
      }
    } catch (err) {
      console.error('Error scanning for QR code:', err);
      setTimeout(scanForQRCode, 100);
    }
  };

  const handleManualInput = () => {
    // For demo purposes, let's create a sample QR data
    const sampleQRData = JSON.stringify({
      type: 'student_payment_verification',
      hash: 'sample_hash_123',
      studentId: '1',
      studentName: 'Test Student',
      totalPayments: 5,
      totalPaid: 150000,
      generatedAt: new Date().toISOString(),
      verifyUrl: `${window.location.origin}/api/payments/verify?hash=sample_hash_123&studentId=1`
    });

    verifyQRCode(sampleQRData);
  };

  const verifyQRCode = async (qrData: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const result = await response.json();

      if (response.ok && result.verified) {
        setVerificationResult(result);
        setIsScanning(false);
        stopCamera();
        onVerificationComplete?.(result);
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Error verifying QR code:', err);
      setError('Failed to verify QR code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <h2 className="font-semibold">QR Code Scanner</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {!verificationResult ? (
            <>
              {/* Camera View */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-4 border-2 border-blue-500 rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                </div>

                {/* Scanning Animation */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1 bg-blue-500 opacity-75 animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Position the QR code within the frame</p>
                <p>The code will be scanned automatically</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Verifying QR code...</span>
                </div>
              )}

              {/* Demo Button */}
              <Button 
                onClick={handleManualInput}
                className="w-full"
                variant="outline"
              >
                Demo: Verify Sample QR Code
              </Button>
            </>
          ) : (
            /* Verification Result */
            <div className="space-y-4">
              {/* Success Header */}
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Verification Successful</h3>
                <p className="text-sm text-green-600">{verificationResult.message}</p>
              </div>

              {/* Student Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="font-medium">{verificationResult.student.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium break-all">{verificationResult.student.email}</p>
                    </div>
                    {verificationResult.student.phone && (
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{verificationResult.student.phone}</p>
                      </div>
                    )}
                    {verificationResult.student.programme && (
                      <div>
                        <span className="text-gray-500">Programme:</span>
                        <p className="font-medium">{verificationResult.student.programme}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-600">
                        {formatCurrency(verificationResult.paymentSummary.paidAmount)}
                      </div>
                      <div className="text-green-700">Total Paid</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-600">
                        {verificationResult.paymentSummary.totalPayments}
                      </div>
                      <div className="text-blue-700">Total Payments</div>
                    </div>
                  </div>
                  
                  {(verificationResult.paymentSummary.pendingPayments > 0 || 
                    verificationResult.paymentSummary.failedPayments > 0) && (
                    <div className="mt-3 flex gap-2">
                      {verificationResult.paymentSummary.pendingPayments > 0 && (
                        <Badge variant="secondary">
                          {verificationResult.paymentSummary.pendingPayments} Pending
                        </Badge>
                      )}
                      {verificationResult.paymentSummary.failedPayments > 0 && (
                        <Badge variant="destructive">
                          {verificationResult.paymentSummary.failedPayments} Failed
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Institution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="h-4 w-4" />
                    Institution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{verificationResult.institution.name}</p>
                  {verificationResult.institution.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {verificationResult.institution.email}
                    </p>
                  )}
                  {verificationResult.institution.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {verificationResult.institution.phone}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Verification Time */}
              <div className="text-center text-xs text-gray-500">
                <Clock className="h-3 w-3 inline mr-1" />
                Verified at {new Date(verificationResult.verifiedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t">
          {verificationResult ? (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              {isScanning && (
                <Button 
                  onClick={() => setIsScanning(false)}
                  variant="destructive" 
                  className="flex-1"
                >
                  Stop Scanning
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}