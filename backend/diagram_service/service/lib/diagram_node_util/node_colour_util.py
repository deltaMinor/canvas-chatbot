class NodeColourUtil:
    def __init__(self, red=255, green=255, blue=255):
        self.red = red
        self.green = green
        self.blue = blue

    def darken(self):
        self.red = (self.red - 25) % 256
        self.blue = (self.blue - 30) % 256
        self.green = (self.green - 35) % 256

    def lighten(self):
        self.red = (self.red + 25) % 256
        self.blue = (self.blue + 30) % 256
        self.green = (self.green + 35) % 256
