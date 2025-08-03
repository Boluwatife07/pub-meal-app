import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface QRCodeData {
  tableNumber: number;
  qrCode: string;
}

export const QRCodeManagement = () => {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [previewQR, setPreviewQR] = useState<string | null>(null);

  useEffect(() => {
    // Generate initial QR codes for tables 1-20
    const initialQRCodes = Array.from({ length: 20 }, (_, i) => {
      const tableNumber = i + 1;
      return {
        tableNumber,
        qrCode: generateQRCodeURL(tableNumber),
      };
    });
    setQRCodes(initialQRCodes);
  }, []);

  const generateQRCodeURL = (tableNumber: number) => {
    // Create a URL that includes the table number
    const baseURL = window.location.origin;
    const menuURL = `${baseURL}/menu?table=${tableNumber}`;
    
    // Using qr-server.com API for QR code generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuURL)}`;
  };

  const addNewTable = () => {
    const tableNumber = parseInt(newTableNumber);
    if (isNaN(tableNumber) || tableNumber <= 0) {
      alert('Please enter a valid table number');
      return;
    }

    if (qrCodes.find(qr => qr.tableNumber === tableNumber)) {
      alert('QR code for this table already exists');
      return;
    }

    const newQR = {
      tableNumber,
      qrCode: generateQRCodeURL(tableNumber),
    };

    setQRCodes([...qrCodes, newQR].sort((a, b) => a.tableNumber - b.tableNumber));
    setNewTableNumber('');
  };

  const downloadQRCode = async (qrCode: QRCodeData) => {
    try {
      // Fetch the image and convert to blob for proper download
      const response = await fetch(qrCode.qrCode);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-${qrCode.tableNumber}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const downloadAllQRCodes = async () => {
    // Download all QR codes with a delay to avoid overwhelming the browser
    for (let i = 0; i < qrCodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i * 300));
      await downloadQRCode(qrCodes[i]);
    }
  };

  const removeTable = (tableNumber: number) => {
    if (confirm(`Are you sure you want to remove QR code for table ${tableNumber}?`)) {
      setQRCodes(qrCodes.filter(qr => qr.tableNumber !== tableNumber));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">QR Code Management</h2>
        <div className="flex gap-2">
          <Button onClick={downloadAllQRCodes} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                type="number"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="Enter table number"
              />
            </div>
            <Button onClick={addNewTable}>
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {qrCodes.map((qrCode) => (
          <Card key={qrCode.tableNumber} className="text-center">
            <CardHeader>
              <CardTitle>Table {qrCode.tableNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={qrCode.qrCode}
                  alt={`QR Code for Table ${qrCode.tableNumber}`}
                  className="w-32 h-32 border rounded"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewQR(qrCode.qrCode)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Table {qrCode.tableNumber} QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center p-4">
                      <img
                        src={qrCode.qrCode}
                        alt={`QR Code for Table ${qrCode.tableNumber}`}
                        className="w-64 h-64 border rounded"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan this code to access the menu for Table {qrCode.tableNumber}
                    </p>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadQRCode(qrCode)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTable(qrCode.tableNumber)}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Use QR Codes:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>1. Print the QR codes and place them on respective tables</li>
          <li>2. When customers scan the QR code, they'll be directed to the menu with their table number automatically set</li>
          <li>3. Orders will include the table number for easy identification</li>
          <li>4. Download individual QR codes or all at once for printing</li>
        </ul>
      </div>
    </div>
  );
};