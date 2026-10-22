import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Bell,
  Lock,
  Unlock,
  UserCheck,
  QrCode,
  Wallet,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  Power
} from 'lucide-react';
import { store } from '../services/store';
import { AdminWithdrawalCard } from './AdminWithdrawalCard';
import { DepositRequest, WithdrawalRequest, UserProfile, DepositWallet, NetworkType } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  user,
  deposits,
  withdrawals,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'deposits' | 'withdrawals' | 'wallets' | 'broadcast'
  >('overview');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allWallets, setAllWallets] = useState<DepositWallet[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Edit user state
  const [editUsdt, setEditUsdt] = useState<number>(user.balance);
  const [editCoins, setEditCoins] = useState<number>(user.coins);
  const [customNotifTitle, setCustomNotifTitle] = useState('');
  const [customNotifMsg, setCustomNotifMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Add new wallet state
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [newWalletNetwork, setNewWalletNetwork] = useState<NetworkType>('USDT (BEP20)');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletQrImage, setNewWalletQrImage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const usersList = store.getAllUsers();
      setAllUsers(usersList.length > 0 ? usersList : [user]);
      setAllWallets(store.getWallets());

      if (!selectedUserId && usersList.length > 0) {
        setSelectedUserId(usersList[0].id);
        setEditUsdt(usersList[0].balance);
        setEditCoins(usersList[0].coins);
      }
    }
  }, [isOpen, user]);

  // Subscribe to store updates when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = store.subscribe(() => {
      const updatedList = store.getAllUsers();
      setAllUsers(updatedList.length > 0 ? updatedList : [user]);
      setAllWallets(store.getWallets());
    });
    return () => unsubscribe();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const selectedUser = allUsers.find((u) => u.id === selectedUserId) || user;

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleApproveDeposit = async (id: string) => {
    await store.approveDeposit(id);
    showFeedback('Deposit request approved and user balance updated!');
  };

  const handleRejectDeposit = async (id: string) => {
    await store.rejectDeposit(id);
    showFeedback('Deposit request rejected.');
  };

  const handleApproveWithdrawal = async (id: string) => {
    await store.approveWithdrawal(id);
    showFeedback('Withdrawal request approved and processed!');
  };

  const handleRejectWithdrawal = async (id: string) => {
    await store.rejectWithdrawal(id);
    showFeedback('Withdrawal request rejected and funds returned.');
  };

  const handleSaveBalance = async () => {
    await store.updateUserBalance(editUsdt, editCoins, selectedUser.id);
    showFeedback(`Balance for user @${selectedUser.username || selectedUser.telegramId} updated successfully!`);
  };

  const handleToggleFreeze = async () => {
    await store.toggleUserFreeze(selectedUser.id);
    showFeedback(`Account status changed to ${selectedUser.status === 'Frozen' ? 'Active' : 'Frozen'}`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNotifTitle || !customNotifMsg) return;

    store.addNotification({
      title: customNotifTitle,
      message: customNotifMsg,
      type: 'system',
    });

    setCustomNotifTitle('');
    setCustomNotifMsg('');
    showFeedback('Broadcast notification sent successfully!');
  };

  // Wallet Management Handlers
  const handleSaveWalletAddress = async (walletId: string, address: string) => {
    await store.updateWallet(walletId, { walletAddress: address });
    showFeedback('Wallet address updated successfully!');
  };

  const handleToggleWalletEnabled = async (walletId: string, currentEnabled: boolean) => {
    await store.updateWallet(walletId, { enabled: !currentEnabled });
    showFeedback(`Wallet status changed to ${!currentEnabled ? 'Enabled' : 'Disabled'}`);
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      await store.deleteWallet(walletId);
      showFeedback('Wallet deleted successfully.');
    }
  };

  const handleQrImageUpload = (walletId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        await store.updateWallet(walletId, { qrImage: reader.result });
        showFeedback('QR code image updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNewWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const qrImage = newWalletQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(newWalletAddress || newWalletNetwork)}`;
    await store.createWallet({
      network: newWalletNetwork,
      walletAddress: newWalletAddress,
      qrImage: qrImage,
      enabled: true,
    });

    setIsAddingWallet(false);
    setNewWalletAddress('');
    setNewWalletQrImage('');
    showFeedback('New wallet created successfully!');
  };

  const pendingDeposits = deposits.filter((d) => d.status === 'Pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0D1117] rounded-3xl border border-[#7CFF4F]/40 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#21262D] bg-[#161B22]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#7CFF4F]/20 text-[#7CFF4F]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F0F6FC] flex items-center gap-2">
                <span>Admin Control Panel</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/30">
                  Aurex Admin
                </span>
              </h2>
              <p className="text-xs text-[#8B949E]">Manage users, deposit wallets, & requests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Feedback Banner */}
        {actionSuccessMsg && (
          <div className="bg-[#7CFF4F]/10 border-b border-[#7CFF4F]/30 text-[#7CFF4F] px-4 py-2.5 text-xs font-bold text-center animate-in fade-in">
            {actionSuccessMsg}
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex border-b border-[#21262D] bg-[#0D1117] overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/60'
                : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-4 py-3 whitespace-nowrap transition-colors border-b-2 relative flex items-center gap-1.5 ${
              activeTab === 'wallets'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/60'
                : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Wallets ({allWallets.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/60'
                : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Users ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-3 whitespace-nowrap transition-colors border-b-2 relative ${
              activeTab === 'deposits'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/60'
                : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Deposits
            {pendingDeposits.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-[#7CFF4F] text-[#0D1117] text-[10px] font-black">
                {pendingDeposits.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-3 whitespace-nowrap transition-colors border-b-2 relative ${
              activeTab === 'withdrawals'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/60'
                : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Withdrawals
            {pendingWithdrawals.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-sky-400 text-[#0D1117] text-[10px] font-black">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-3 whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'broadcast'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/60'
                : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Broadcast
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#161B22] border border-[#21262D]">
                  <div className="flex items-center space-x-2 text-[#8B949E] text-xs mb-1">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Total Registered Users</span>
                  </div>
                  <p className="text-2xl font-black text-[#F0F6FC]">{allUsers.length}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#161B22] border border-[#21262D]">
                  <div className="flex items-center space-x-2 text-[#8B949E] text-xs mb-1">
                    <DollarSign className="w-4 h-4 text-[#7CFF4F]" />
                    <span>Total User Balances</span>
                  </div>
                  <p className="text-2xl font-black text-[#7CFF4F]">
                    ${allUsers.reduce((acc, u) => acc + u.balance, 0).toFixed(2)} USDT
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#161B22] border border-[#21262D]">
                  <div className="flex items-center space-x-2 text-[#8B949E] text-xs mb-1">
                    <ArrowDownLeft className="w-4 h-4 text-[#7CFF4F]" />
                    <span>Approved Deposits</span>
                  </div>
                  <p className="text-2xl font-black text-[#F0F6FC]">
                    ${deposits.filter((d) => d.status === 'Approved').reduce((acc, d) => acc + d.amount, 0).toFixed(2)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#161B22] border border-[#21262D]">
                  <div className="flex items-center space-x-2 text-[#8B949E] text-xs mb-1">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span>Configured Deposit Wallets</span>
                  </div>
                  <p className="text-2xl font-black text-[#F0F6FC]">{allWallets.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WALLETS MANAGEMENT */}
          {activeTab === 'wallets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
                <div>
                  <h3 className="text-sm font-bold text-[#F0F6FC]">Deposit Wallets Config</h3>
                  <p className="text-xs text-[#8B949E]">
                    Edit wallet addresses, QR images, & activation for random rotation
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingWallet(!isAddingWallet)}
                  className="px-3 py-1.5 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-black text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Wallet</span>
                </button>
              </div>

              {/* Add New Wallet Form */}
              {isAddingWallet && (
                <form
                  onSubmit={handleCreateNewWallet}
                  className="p-4 rounded-2xl bg-[#161B22] border border-[#7CFF4F]/40 space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-[#7CFF4F]">Add New Deposit Wallet</h4>

                  <div>
                    <label className="text-[11px] text-[#8B949E] block mb-1 font-semibold">Select Network</label>
                    <select
                      value={newWalletNetwork}
                      onChange={(e) => setNewWalletNetwork(e.target.value as NetworkType)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    >
                      <option value="USDT (BEP20)">USDT (BEP20)</option>
                      <option value="TRX (TRON)">TRX (TRON)</option>
                      <option value="BNB (BEP20)">BNB (BEP20)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8B949E] block mb-1 font-semibold">Wallet Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 0x1B1A26E89d0DB6b0E98B781Bc52dF8091f4ABeB5"
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] text-[#F0F6FC] font-mono text-xs rounded-xl px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-bold text-xs"
                    >
                      Save New Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingWallet(false)}
                      className="px-4 py-2 rounded-xl bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Wallets List Grouped by Network */}
              {(['USDT (BEP20)', 'TRX (TRON)', 'BNB (BEP20)'] as NetworkType[]).map((net) => {
                const netWallets = allWallets.filter((w) => w.network === net);
                return (
                  <div key={net} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#7CFF4F] uppercase tracking-wider px-1">
                        {net} ({netWallets.length} Wallets)
                      </span>
                    </div>

                    {netWallets.length === 0 ? (
                      <p className="text-xs text-[#8B949E] italic px-1">No wallets configured for {net}.</p>
                    ) : (
                      <div className="space-y-3">
                        {netWallets.map((wallet, idx) => (
                          <WalletCardItem
                            key={wallet.id}
                            wallet={wallet}
                            index={idx + 1}
                            onSaveAddress={(addr) => handleSaveWalletAddress(wallet.id, addr)}
                            onToggleEnabled={() => handleToggleWalletEnabled(wallet.id, wallet.enabled)}
                            onDelete={() => handleDeleteWallet(wallet.id)}
                            onUploadQr={(e) => handleQrImageUpload(wallet.id, e)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 bg-[#161B22] p-2.5 rounded-2xl border border-[#21262D]">
                <Users className="w-4 h-4 text-[#8B949E]" />
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    const u = allUsers.find((userObj) => userObj.id === e.target.value);
                    if (u) {
                      setSelectedUserId(u.id);
                      setEditUsdt(u.balance);
                      setEditCoins(u.coins);
                    }
                  }}
                  className="w-full bg-transparent text-xs font-bold text-[#F0F6FC] outline-none"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[#161B22] text-[#F0F6FC]">
                      @{u.username || u.telegramId} - {u.firstName} (ID: {u.telegramId || u.id})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="p-4 rounded-2xl bg-[#161B22] border border-[#21262D] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F6FC]">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h4>
                      <p className="text-xs text-[#8B949E]">
                        @{selectedUser.username || 'no_username'} • ID: {selectedUser.telegramId || selectedUser.id}
                      </p>
                    </div>

                    <button
                      onClick={handleToggleFreeze}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        selectedUser.status === 'Frozen'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {selectedUser.status === 'Frozen' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{selectedUser.status === 'Frozen' ? 'Unfreeze' : 'Freeze User'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#8B949E] block mb-1">USDT Balance</label>
                      <input
                        type="number"
                        value={editUsdt}
                        onChange={(e) => setEditUsdt(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl px-3 py-2 text-xs font-bold text-[#F0F6FC] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-[#8B949E] block mb-1">Coins Balance</label>
                      <input
                        type="number"
                        value={editCoins}
                        onChange={(e) => setEditCoins(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl px-3 py-2 text-xs font-bold text-[#F0F6FC] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBalance}
                    className="w-full py-2.5 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-bold text-xs transition-colors shadow-lg shadow-[#7CFF4F]/10"
                  >
                    Save Balance to Firestore
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DEPOSITS */}
          {activeTab === 'deposits' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                Pending Deposits ({pendingDeposits.length})
              </h3>

              {deposits.length === 0 ? (
                <p className="text-xs text-[#8B949E] text-center py-6">No deposit requests found in system.</p>
              ) : (
                deposits.map((dep) => (
                  <div key={dep.id} className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-[#F0F6FC]">${dep.amount} USDT</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/20">
                          {dep.network}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dep.status === 'Approved'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : dep.status === 'Rejected'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {dep.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8B949E]">
                        {new Date(dep.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {dep.walletAddress && (
                      <div className="text-[11px] text-[#8B949E]">
                        Target Wallet: <span className="font-mono text-[#F0F6FC]">{dep.walletAddress}</span>
                      </div>
                    )}

                    {dep.imageProof && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#7CFF4F] flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> Transfer Proof Screenshot:
                        </span>
                        <a href={dep.imageProof} target="_blank" rel="noreferrer">
                          <img
                            src={dep.imageProof}
                            alt="Transfer Proof"
                            className="max-h-40 rounded-xl border border-[#30363D] object-contain bg-black/40 p-1"
                          />
                        </a>
                      </div>
                    )}

                    <div className="text-[11px] text-[#8B949E] bg-[#0D1117] p-2.5 rounded-xl border border-[#21262D] font-mono break-all text-left">
                      TXID: {dep.txHash}
                    </div>

                    {dep.status === 'Pending' && (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleApproveDeposit(dep.id)}
                          className="flex-1 py-2 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve & Credit (${dep.amount})
                        </button>
                        <button
                          onClick={() => handleRejectDeposit(dep.id)}
                          className="py-2 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-red-500/30 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: WITHDRAWALS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                Pending Withdrawals ({pendingWithdrawals.length})
              </h3>

              {withdrawals.length === 0 ? (
                <p className="text-xs text-[#8B949E] text-center py-6">No pending withdrawal requests.</p>
              ) : (
                withdrawals.map((wd) => {
                  const wdUser = allUsers.find((u) => u.id === wd.userId);
                  return (
                    <AdminWithdrawalCard
                      key={wd.id}
                      wd={wd}
                      userProfile={wdUser}
                      onApprove={handleApproveWithdrawal}
                      onReject={handleRejectWithdrawal}
                      onToast={(msg) => showFeedback(msg)}
                    />
                  );
                })
              )}
            </div>
          )}

          {/* TAB 6: BROADCAST NOTIFICATION */}
          {activeTab === 'broadcast' && (
            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#161B22] border border-[#21262D] space-y-3">
                <h4 className="text-xs font-bold text-[#F0F6FC] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#7CFF4F]" />
                  <span>Send Broadcast Notification to All Users</span>
                </h4>

                <div>
                  <label className="text-[11px] text-[#8B949E] block mb-1">Notification Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 🎁 Exclusive Deposit Bonus!"
                    value={customNotifTitle}
                    onChange={(e) => setCustomNotifTitle(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl px-3 py-2.5 text-xs text-[#F0F6FC] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#8B949E] block mb-1">Message Body</label>
                  <textarea
                    rows={3}
                    placeholder="Type broadcast message details here..."
                    value={customNotifMsg}
                    onChange={(e) => setCustomNotifMsg(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl px-3 py-2.5 text-xs text-[#F0F6FC] outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-bold text-xs transition-colors shadow-lg shadow-[#7CFF4F]/10"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual wallet card in Admin Panel
interface WalletCardItemProps {
  wallet: DepositWallet;
  index: number;
  onSaveAddress: (address: string) => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
  onUploadQr: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const WalletCardItem: React.FC<WalletCardItemProps> = ({
  wallet,
  index,
  onSaveAddress,
  onToggleEnabled,
  onDelete,
  onUploadQr,
}) => {
  const [addressInput, setAddressInput] = useState(wallet.walletAddress || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setAddressInput(wallet.walletAddress || '');
  }, [wallet.walletAddress]);

  const handleSave = () => {
    onSaveAddress(addressInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-xs text-[#F0F6FC]">Wallet #{index}</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              wallet.enabled !== false
                ? 'bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}
          >
            {wallet.enabled !== false ? 'Active' : 'Disabled'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
              wallet.enabled !== false
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'bg-[#7CFF4F]/10 text-[#7CFF4F] hover:bg-[#7CFF4F]/20'
            }`}
            title={wallet.enabled !== false ? 'Disable Wallet' : 'Enable Wallet'}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            title="Delete Wallet"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Wallet Address Input */}
      <div>
        <label className="text-[10px] text-[#8B949E] block mb-1 font-semibold">Wallet Address:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="e.g. 0x..."
            className="flex-1 bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl px-3 py-1.5 text-xs font-mono text-[#F0F6FC] outline-none"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-bold text-xs shrink-0 transition-colors"
          >
            {isSaved ? <Check className="w-4 h-4" /> : 'Save'}
          </button>
        </div>
      </div>

      {/* QR Image Preview & Upload */}
      <div className="flex items-center justify-between bg-[#0D1117] p-2 rounded-xl border border-[#21262D]">
        <div className="flex items-center gap-2">
          <img src={wallet.qrImage} alt="QR Code" className="w-12 h-12 object-contain bg-white rounded p-1 border" />
          <span className="text-[10px] text-[#8B949E]">Current QR Image</span>
        </div>

        <div>
          <label className="px-3 py-1.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5 text-[#7CFF4F]" />
            <span>Change QR Image</span>
            <input type="file" accept="image/*" onChange={onUploadQr} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
