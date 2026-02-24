// //  Registration page
// // src/app/auth/register/page.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { account, ID } from '@/lib/appwrite';
// import { patientService } from '@/services/patient.service';
// import { toAppwriteDatetime } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

// export default function RegisterPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const formData = new FormData(e.currentTarget);
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;
//     const firstName = formData.get('firstName') as string;
//     const lastName = formData.get('lastName') as string;
//     const phone = formData.get('phone') as string;
//     const dateOfBirth = formData.get('dateOfBirth') as string;
//     const address = formData.get('address') as string;
//     const city = formData.get('city') as string;

//     try {
//       // Step 1: Create Appwrite Auth account
//       const user = await account.create(
//         ID.unique(),
//         email,
//         password,
//         `${firstName} ${lastName}`
//       );

//       // Step 2: Create patient profile
//       await patientService.createPatient({
//         userId: user.$id,
//         firstName,
//         lastName,
//         phone: phone || undefined,
//         dateOfBirth: toAppwriteDatetime(dateOfBirth), 
//         gender,
//         address: address || undefined,
//         city: city || undefined,
//       });


//       router.push('/auth/login');
//     } catch (err: any) {
//       console.error('Registration error:', err);
//       setError(err.message || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Patient Registration</CardTitle>
//           <CardDescription>
//             Create your account to book medical appointments
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Personal Info */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="firstName">First Name *</Label>
//                 <Input id="firstName" name="firstName" required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="lastName">Last Name *</Label>
//                 <Input id="lastName" name="lastName" required />
//               </div>
//             </div>

//             {/* Contact */}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email *</Label>
//               <Input id="email" name="email" type="email" required />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone</Label>
//               <Input id="phone" name="phone" type="tel" placeholder="+213 XXX XXX XXX" />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password *</Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 minLength={8}
//                 required
//               />
//             </div>

//             {/* Medical Info */}
//             <div className="space-y-2">
//               <Label htmlFor="dateOfBirth">Date of Birth *</Label>
//               <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="gender">Gender *</Label>
//               <Select value={gender} onValueChange={(value: any) => setGender(value)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="male">Male</SelectItem>
//                   <SelectItem value="female">Female</SelectItem>
//                   <SelectItem value="other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Address (Optional) */}
//             <div className="space-y-2">
//               <Label htmlFor="address">Address</Label>
//               <Input id="address" name="address" placeholder="123 Main St" />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="city">City</Label>
//               <Input id="city" name="city" placeholder="Tlemcen" />
//             </div>

//             {error && (
//               <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
//                 {error}
//               </div>
//             )}

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? 'Creating Account...' : 'Register'}
//             </Button>

//             <p className="text-sm text-center text-gray-600">
//               Already have an account?{' '}
//               <a href="/auth/login" className="text-blue-600 hover:underline">
//                 Log in
//               </a>
//             </p>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
//  Registration page
// src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, ID } from '@/lib/appwrite';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { toAppwriteDatetime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  
  // Doctor-specific files
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handlePatientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;

    try {
      const user = await account.create(
        ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`
      );

      await patientService.createPatient({
        userId: user.$id,
        firstName,
        lastName,
        phone: phone || undefined,
        dateOfBirth: toAppwriteDatetime(dateOfBirth),
        gender,
        address: address || undefined,
        city: city || undefined,
      });

      router.push('/auth/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const specialization = formData.get('specialization') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    const clinicAddress = formData.get('clinicAddress') as string;
    const city = formData.get('city') as string;
    const consultationFee = formData.get('consultationFee') as string;
    const bio = formData.get('bio') as string;

    try {
      // Validate files
      if (!licenseFile) {
        setError('Medical license document is required');
        setLoading(false);
        return;
      }

      // Create Auth account
      const user = await account.create(
        ID.unique(),
        email,
        password,
        `Dr. ${firstName} ${lastName}`
      );

      // Upload license document
      const licenseDocumentId = await doctorService.uploadFile(licenseFile);

      // Upload profile image (optional)
      let profileImageId: string | undefined;
      if (profileImage) {
        profileImageId = await doctorService.uploadFile(profileImage);
      }

      // Create doctor profile
      await doctorService.createDoctor({
        userId: user.$id,
        firstName,
        lastName,
        email,
        phone,
        specialization,
        licenseNumber,
        clinicAddress,
        city,
        consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
        bio: bio || undefined,
        licenseDocumentId,
        profileImageId,
      });

      router.push('/auth/login');
    } catch (err: any) {
      console.error('Doctor registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Register as a patient or doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(v) => setRole(v as 'patient' | 'doctor')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>

            {/* Patient Registration */}
            <TabsContent value="patient">
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register as Patient'}
                </Button>
              </form>
            </TabsContent>

            {/* Doctor Registration */}
            <TabsContent value="doctor">
              <form onSubmit={handleDoctorSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-firstName">First Name *</Label>
                    <Input id="doc-firstName" name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-lastName">Last Name *</Label>
                    <Input id="doc-lastName" name="lastName" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-email">Email *</Label>
                  <Input id="doc-email" name="email" type="email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-password">Password *</Label>
                  <Input
                    id="doc-password"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-phone">Phone *</Label>
                  <Input id="doc-phone" name="phone" type="tel" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    placeholder="e.g., Cardiology"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Medical License Number *</Label>
                  <Input id="licenseNumber" name="licenseNumber" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicAddress">Clinic Address *</Label>
                  <Input id="clinicAddress" name="clinicAddress" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-city">City *</Label>
                  <Input id="doc-city" name="city" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee (DZD)</Label>
                  <Input
                    id="consultationFee"
                    name="consultationFee"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 3000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    placeholder="Brief professional summary..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseFile">Medical License Document *</Label>
                  <Input
                    id="licenseFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-gray-500">Upload PDF or image</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Photo (Optional)</Label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register as Doctor'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Your account will be pending verification by admin
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}