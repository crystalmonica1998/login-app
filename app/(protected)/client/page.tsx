'use client';
import UserInfo from '@/components/user-info';
import { useCurrentUser } from '@/hooks/use-current-user';
import React from 'react'

const ClientPage = () => {
    const user = useCurrentUser();
    console.log('client user: ', user);

  return (
    <UserInfo user={user} label='📱 Client component' />
  )
}

export default ClientPage