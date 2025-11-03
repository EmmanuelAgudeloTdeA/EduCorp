import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { UserIcon } from '@heroicons/react/24/outline';

const Profile = () => {
    const { user } = useAuth();
  return (
    <div className='space-y-6 flex justify-center items-start'>
        <div className='bg-white rounded-lg shadow-sm p-6 flex flex-col justify-start items-center gap-6 w-1/2'>
            <span className='text-gray-600 p-6 rounded-full bg-gray-100'>
                <UserIcon className='w-25 h-25'/>
            </span>
            <div className='flex flex-col justify-start items-center gap-2'>
                <h1 className='text-2xl font-bold text-gray-900'>
                    {user?.email}
                </h1>
                <p className='text-gray-600'>
                    {user?.email}
                </p>
            </div>
        </div>
    </div>
  )
}

export default Profile