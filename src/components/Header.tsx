
import React, { useState, useRef } from 'react';
import { Award, User, Bluetooth, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Make sure Header is rendered inside a <BrowserRouter> in your app entry point

// Mock Bluetooth devices data
const mockBluetoothDevices = [
  { id: '1', name: 'Fitbit Charge 4', type: 'Wearable', connected: false },
  { id: '2', name: 'Apple Watch Series 6', type: 'Wearable', connected: false }
];

interface BluetoothPopupProps {
  onClose: () => void;
}

const BluetoothPopup: React.FC<BluetoothPopupProps> = ({ onClose }) => {
  const [devices, setDevices] = useState(mockBluetoothDevices);

  const toggleConnection = (deviceId: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device => {
        if (device.id === deviceId) {
          // If connecting this device, disconnect all others
          return { ...device, connected: !device.connected };
        } else {
          // Disconnect all other devices when connecting a new one
          const targetDevice = prevDevices.find(d => d.id === deviceId);
          if (targetDevice && !targetDevice.connected) {
            // We're connecting the target device, so disconnect this one
            return { ...device, connected: false };
          }
          // Keep current state if we're just disconnecting
          return device;
        }
      })
    );
  };

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Bluetooth Devices</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* Connection Status */}
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {devices.some(d => d.connected) ? (
              <span className="flex items-center gap-1 text-green-700">
                <Check className="w-3 h-3" />
                Connected to: {devices.find(d => d.connected)?.name}
              </span>
            ) : (
              <span className="text-gray-500">No devices connected</span>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                device.connected 
                  ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">{device.name}</div>
                <div className="text-sm text-gray-500">{device.type}</div>
              </div>
              
              <div className="flex items-center gap-2">
                {device.connected && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Connected
                  </span>
                )}
                
                <button
                  onClick={() => toggleConnection(device.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${
                    device.connected
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {device.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add New Device
          </button>
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bluetoothOpen, setBluetoothOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bluetoothRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        bluetoothRef.current &&
        !bluetoothRef.current.contains(event.target as Node)
      ) {
        setBluetoothOpen(false);
      }
    }
    if (dropdownOpen || bluetoothOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, bluetoothOpen]);

  if (!user) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">YouMatter</h1>
              <p className="text-xs text-gray-500">{user.tier} Tier</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bluetooth Icon */}
            <div className="relative" ref={bluetoothRef}>
              <button
                onClick={() => setBluetoothOpen((open) => !open)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Bluetooth Devices"
              >
                <Bluetooth className="w-5 h-5 text-gray-600" />
              </button>
              {bluetoothOpen && (
                <BluetoothPopup onClose={() => setBluetoothOpen(false)} />
              )}
            </div>

            {/* Profile Icon */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Profile"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => {
                      setDropdownOpen(false);
                      // Use replace: false to push to history stack
                      navigate('/profile', { replace: false });
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
