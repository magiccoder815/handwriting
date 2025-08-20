import torch
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from model import DigitCNN

# Transform: convert MNIST images to tensor
transform = transforms.ToTensor()

# Load dataset
train_dataset = datasets.MNIST(root="./data", train=True, download=True, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)

# Init model, optimizer, loss
model = DigitCNN()
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = torch.nn.CrossEntropyLoss()

# Training loop (1 epoch = one pass over dataset)
for epoch in range(1):  # you can increase to 5–10 for better accuracy
    total_loss = 0
    for images, labels in train_loader:
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    print(f"Epoch {epoch+1}, Loss: {total_loss:.4f}")

# Save trained model
torch.save(model.state_dict(), "mnist_cnn.pth")
print("✅ Model trained and saved to mnist_cnn.pth")