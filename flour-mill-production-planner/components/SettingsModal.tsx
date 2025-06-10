import React, { useState, useEffect } from 'react';
import { MillSettings, PackerSettings } from '../types';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMillSettings: MillSettings;
  onSaveMillSettings: (settings: MillSettings) => void;
  currentPackerSettings: PackerSettings;
  onSavePackerSettings: (settings: PackerSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentMillSettings,
  onSaveMillSettings,
  currentPackerSettings,
  onSavePackerSettings,
}) => {
  const [millSettings, setMillSettings] = useState<MillSettings>(currentMillSettings);
  const [packerSettings, setPackerSettings] = useState<PackerSettings>(currentPackerSettings);

  useEffect(() => {
    setMillSettings(currentMillSettings);
  }, [currentMillSettings]);

  useEffect(() => {
    setPackerSettings(currentPackerSettings);
  }, [currentPackerSettings]);

  const handleMillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMillSettings(prev => ({ ...prev, [name]: name === 'extractionRate' ? parseFloat(value) : parseInt(value, 10) }));
  };
  
  const handlePackerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPackerSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSave = () => {
    onSaveMillSettings(millSettings);
    onSavePackerSettings(packerSettings);
    onClose();
  };

  const totalDailyWheatCapacity = millSettings.numberOfMills * millSettings.wheatPerMillPerDayTonnes;
  const totalDailyFlourCapacity = totalDailyWheatCapacity * millSettings.extractionRate;
  const totalDailyPackingCapacity = packerSettings.numberOfPackers * packerSettings.capacityPerPackerKgPerDay;


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Settings" size="lg">
      <div className="space-y-8">
        {/* Mill Settings */}
        <section>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">Mill Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Number of Mills"
              id="numberOfMills"
              name="numberOfMills"
              type="number"
              value={millSettings.numberOfMills}
              onChange={handleMillChange}
              min="1"
            />
            <Input
              label="Wheat Capacity per Mill (Tonnes/Day)"
              id="wheatPerMillPerDayTonnes"
              name="wheatPerMillPerDayTonnes"
              type="number"
              value={millSettings.wheatPerMillPerDayTonnes}
              onChange={handleMillChange}
              min="0"
            />
            <Input
              label="Extraction Rate (e.g., 0.75 for 75%)"
              id="extractionRate"
              name="extractionRate"
              type="number"
              value={millSettings.extractionRate}
              onChange={handleMillChange}
              step="0.01"
              min="0"
              max="1"
            />
             <div>
                <p className="text-sm text-gray-600 mt-1">Total Daily Wheat Capacity: <strong className="text-gray-800">{totalDailyWheatCapacity.toLocaleString()} tonnes</strong></p>
                <p className="text-sm text-gray-600">Total Daily Flour Output: <strong className="text-gray-800">{totalDailyFlourCapacity.toLocaleString()} tonnes</strong></p>
            </div>
          </div>
        </section>

        {/* Packer Settings */}
        <section>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">Packer Configuration</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Number of Packers"
              id="numberOfPackers"
              name="numberOfPackers"
              type="number"
              value={packerSettings.numberOfPackers}
              onChange={handlePackerChange}
              min="0"
            />
            <Input
              label="Capacity per Packer (kg/Day)"
              id="capacityPerPackerKgPerDay"
              name="capacityPerPackerKgPerDay"
              type="number"
              value={packerSettings.capacityPerPackerKgPerDay}
              onChange={handlePackerChange}
              min="0"
            />
             <div>
                <p className="text-sm text-gray-600 mt-1">Total Daily Packing Capacity: <strong className="text-gray-800">{(totalDailyPackingCapacity / 1000).toLocaleString()} tonnes</strong></p>
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
