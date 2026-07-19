--!strict

local Studio = settings().Studio

local UI = {}
UI.__index = UI

type Palette = {
	background: Color3,
	surface: Color3,
	surfaceRaised: Color3,
	border: Color3,
	text: Color3,
	muted: Color3,
	input: Color3,
}

local function palette(): Palette
	if Studio.Theme.Name == "Dark" then
		return {
			background = Color3.fromRGB(14, 15, 17),
			surface = Color3.fromRGB(22, 23, 26),
			surfaceRaised = Color3.fromRGB(29, 30, 34),
			border = Color3.fromRGB(52, 54, 60),
			text = Color3.fromRGB(242, 243, 245),
			muted = Color3.fromRGB(158, 161, 171),
			input = Color3.fromRGB(17, 18, 21),
		}
	end
	return {
		background = Color3.fromRGB(247, 247, 248),
		surface = Color3.fromRGB(255, 255, 255),
		surfaceRaised = Color3.fromRGB(249, 249, 250),
		border = Color3.fromRGB(224, 225, 229),
		text = Color3.fromRGB(24, 24, 27),
		muted = Color3.fromRGB(104, 107, 116),
		input = Color3.fromRGB(255, 255, 255),
	}
end

local function corner(parent: Instance, radius: number)
	local item = Instance.new("UICorner")
	item.CornerRadius = UDim.new(0, radius)
	item.Parent = parent
end

local function stroke(parent: Instance, color: Color3)
	local item = Instance.new("UIStroke")
	item.Color = color
	item.Thickness = 1
	item.Parent = parent
	return item
end

local function label(parent: Instance, text: string, size: number, weight: Enum.FontWeight): TextLabel
	local item = Instance.new("TextLabel")
	item.BackgroundTransparency = 1
	item.AutomaticSize = Enum.AutomaticSize.Y
	item.Size = UDim2.new(1, 0, 0, 0)
	item.FontFace = Font.new("rbxasset://fonts/families/GothamSSm.json", weight)
	item.Text = text
	item.TextSize = size
	item.TextWrapped = true
	item.TextXAlignment = Enum.TextXAlignment.Left
	item.Parent = parent
	return item
end

function UI.new(widget: DockWidgetPluginGui)
	local self = setmetatable({}, UI)
	self._connectHandler = nil
	self._themed = {}
	self._strokes = {}

	local root = Instance.new("Frame")
	root.Name = "Root"
	root.Size = UDim2.fromScale(1, 1)
	root.BorderSizePixel = 0
	root.Parent = widget
	self.Root = root
	table.insert(self._themed, { root, "BackgroundColor3", "background" })

	local scroll = Instance.new("ScrollingFrame")
	scroll.Name = "Content"
	scroll.Size = UDim2.fromScale(1, 1)
	scroll.BackgroundTransparency = 1
	scroll.BorderSizePixel = 0
	scroll.ScrollBarThickness = 4
	scroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
	scroll.CanvasSize = UDim2.new()
	scroll.Parent = root

	local padding = Instance.new("UIPadding")
	padding.PaddingTop = UDim.new(0, 24)
	padding.PaddingBottom = UDim.new(0, 24)
	padding.PaddingLeft = UDim.new(0, 22)
	padding.PaddingRight = UDim.new(0, 22)
	padding.Parent = scroll

	local list = Instance.new("UIListLayout")
	list.Padding = UDim.new(0, 14)
	list.SortOrder = Enum.SortOrder.LayoutOrder
	list.Parent = scroll

	local brandRow = Instance.new("Frame")
	brandRow.BackgroundTransparency = 1
	brandRow.Size = UDim2.new(1, 0, 0, 34)
	brandRow.LayoutOrder = 1
	brandRow.Parent = scroll

	local mark = Instance.new("Frame")
	mark.Size = UDim2.fromOffset(32, 32)
	mark.BorderSizePixel = 0
	mark.BackgroundColor3 = Color3.fromRGB(23, 23, 26)
	mark.Parent = brandRow
	corner(mark, 9)
	local markText = label(mark, "P", 15, Enum.FontWeight.Bold)
	markText.Size = UDim2.fromScale(1, 1)
	markText.AutomaticSize = Enum.AutomaticSize.None
	markText.TextColor3 = Color3.new(1, 1, 1)
	markText.TextXAlignment = Enum.TextXAlignment.Center
	markText.TextYAlignment = Enum.TextYAlignment.Center

	local brand = label(brandRow, "Pathfinder", 17, Enum.FontWeight.Bold)
	brand.Position = UDim2.fromOffset(43, 4)
	brand.Size = UDim2.new(1, -110, 0, 25)
	brand.AutomaticSize = Enum.AutomaticSize.None
	table.insert(self._themed, { brand, "TextColor3", "text" })

	local alpha = label(brandRow, "ALPHA 1", 9, Enum.FontWeight.Medium)
	alpha.AnchorPoint = Vector2.new(1, 0)
	alpha.Position = UDim2.new(1, 0, 0, 8)
	alpha.Size = UDim2.fromOffset(58, 18)
	alpha.AutomaticSize = Enum.AutomaticSize.None
	alpha.TextXAlignment = Enum.TextXAlignment.Center
	alpha.TextColor3 = Color3.fromRGB(16, 133, 86)
	alpha.BackgroundColor3 = Color3.fromRGB(222, 248, 237)
	alpha.BackgroundTransparency = 0
	corner(alpha, 9)

	local intro = label(scroll, "Connect this Studio place to your Pathfinder account.", 13, Enum.FontWeight.Regular)
	intro.LayoutOrder = 2
	intro.LineHeight = 1.35
	table.insert(self._themed, { intro, "TextColor3", "muted" })

	local card = Instance.new("Frame")
	card.AutomaticSize = Enum.AutomaticSize.Y
	card.Size = UDim2.new(1, 0, 0, 0)
	card.BorderSizePixel = 0
	card.LayoutOrder = 3
	card.Parent = scroll
	corner(card, 12)
	table.insert(self._themed, { card, "BackgroundColor3", "surface" })
	local cardStroke = stroke(card, Color3.new())
	table.insert(self._strokes, cardStroke)

	local cardPadding = Instance.new("UIPadding")
	cardPadding.PaddingTop = UDim.new(0, 18)
	cardPadding.PaddingBottom = UDim.new(0, 18)
	cardPadding.PaddingLeft = UDim.new(0, 18)
	cardPadding.PaddingRight = UDim.new(0, 18)
	cardPadding.Parent = card
	local cardList = Instance.new("UIListLayout")
	cardList.Padding = UDim.new(0, 12)
	cardList.Parent = card

	local statusRow = Instance.new("Frame")
	statusRow.BackgroundTransparency = 1
	statusRow.Size = UDim2.new(1, 0, 0, 24)
	statusRow.Parent = card
	local statusTitle = label(statusRow, "Studio connection", 13, Enum.FontWeight.Medium)
	statusTitle.Size = UDim2.new(1, -92, 0, 22)
	statusTitle.AutomaticSize = Enum.AutomaticSize.None
	table.insert(self._themed, { statusTitle, "TextColor3", "text" })

	local status = label(statusRow, "Not connected", 10, Enum.FontWeight.Medium)
	status.AnchorPoint = Vector2.new(1, 0)
	status.Position = UDim2.new(1, 0, 0, 1)
	status.Size = UDim2.fromOffset(86, 21)
	status.AutomaticSize = Enum.AutomaticSize.None
	status.TextXAlignment = Enum.TextXAlignment.Center
	status.TextColor3 = Color3.fromRGB(178, 72, 45)
	status.BackgroundColor3 = Color3.fromRGB(255, 238, 231)
	status.BackgroundTransparency = 0
	corner(status, 11)
	self.Status = status

	local instruction = label(card, "Generate a connection code at pathfinderlabs.vercel.app/dashboard/studio, then enter it below.", 11, Enum.FontWeight.Regular)
	instruction.LineHeight = 1.4
	table.insert(self._themed, { instruction, "TextColor3", "muted" })
	self.Instruction = instruction

	local input = Instance.new("TextBox")
	input.Size = UDim2.new(1, 0, 0, 42)
	input.ClearTextOnFocus = false
	input.PlaceholderText = "6-character code"
	input.Text = ""
	input.TextSize = 14
	input.FontFace = Font.new("rbxasset://fonts/families/GothamSSm.json", Enum.FontWeight.Medium)
	input.TextXAlignment = Enum.TextXAlignment.Left
	input.BorderSizePixel = 0
	input.Parent = card
	corner(input, 8)
	local inputPadding = Instance.new("UIPadding")
	inputPadding.PaddingLeft = UDim.new(0, 13)
	inputPadding.PaddingRight = UDim.new(0, 13)
	inputPadding.Parent = input
	table.insert(self._themed, { input, "BackgroundColor3", "input" })
	table.insert(self._themed, { input, "TextColor3", "text" })
	local inputStroke = stroke(input, Color3.new())
	table.insert(self._strokes, inputStroke)
	self.Input = input

	local connect = Instance.new("TextButton")
	connect.Size = UDim2.new(1, 0, 0, 42)
	connect.BorderSizePixel = 0
	connect.AutoButtonColor = true
	connect.BackgroundColor3 = Color3.fromRGB(23, 23, 26)
	connect.TextColor3 = Color3.new(1, 1, 1)
	connect.Text = "Connect Studio"
	connect.TextSize = 13
	connect.FontFace = Font.new("rbxasset://fonts/families/GothamSSm.json", Enum.FontWeight.Medium)
	connect.Parent = card
	corner(connect, 8)
	self.Connect = connect

	local message = label(card, "", 11, Enum.FontWeight.Regular)
	message.Visible = false
	message.LineHeight = 1.35
	self.Message = message

	local placeCard = Instance.new("Frame")
	placeCard.AutomaticSize = Enum.AutomaticSize.Y
	placeCard.Size = UDim2.new(1, 0, 0, 0)
	placeCard.BorderSizePixel = 0
	placeCard.LayoutOrder = 4
	placeCard.Visible = false
	placeCard.Parent = scroll
	corner(placeCard, 12)
	table.insert(self._themed, { placeCard, "BackgroundColor3", "surface" })
	local placeStroke = stroke(placeCard, Color3.new())
	table.insert(self._strokes, placeStroke)
	local placePadding = Instance.new("UIPadding")
	placePadding.PaddingTop = UDim.new(0, 16)
	placePadding.PaddingBottom = UDim.new(0, 16)
	placePadding.PaddingLeft = UDim.new(0, 18)
	placePadding.PaddingRight = UDim.new(0, 18)
	placePadding.Parent = placeCard
	local placeList = Instance.new("UIListLayout")
	placeList.Padding = UDim.new(0, 7)
	placeList.Parent = placeCard
	local placeTitle = label(placeCard, "Connected place", 11, Enum.FontWeight.Medium)
	table.insert(self._themed, { placeTitle, "TextColor3", "muted" })
	local placeName = label(placeCard, game.Name, 14, Enum.FontWeight.Medium)
	table.insert(self._themed, { placeName, "TextColor3", "text" })
	local account = label(placeCard, "", 11, Enum.FontWeight.Regular)
	table.insert(self._themed, { account, "TextColor3", "muted" })
	self.PlaceCard = placeCard
	self.PlaceName = placeName
	self.Account = account

	local buildCard = Instance.new("Frame")
	buildCard.AutomaticSize = Enum.AutomaticSize.Y
	buildCard.Size = UDim2.new(1, 0, 0, 0)
	buildCard.BorderSizePixel = 0
	buildCard.LayoutOrder = 5
	buildCard.Parent = scroll
	corner(buildCard, 12)
	table.insert(self._themed, { buildCard, "BackgroundColor3", "surfaceRaised" })
	local buildPadding = Instance.new("UIPadding")
	buildPadding.PaddingTop = UDim.new(0, 16)
	buildPadding.PaddingBottom = UDim.new(0, 16)
	buildPadding.PaddingLeft = UDim.new(0, 18)
	buildPadding.PaddingRight = UDim.new(0, 18)
	buildPadding.Parent = buildCard
	local buildText = label(buildCard, "Build execution arrives in Alpha 2. Alpha 1 verifies the secure website-to-Studio connection.", 11, Enum.FontWeight.Regular)
	buildText.LineHeight = 1.4
	table.insert(self._themed, { buildText, "TextColor3", "muted" })

	connect.Activated:Connect(function()
		if self._connectHandler then
			self._connectHandler(input.Text)
		end
	end)
	input.FocusLost:Connect(function(enterPressed)
		if enterPressed and self._connectHandler then
			self._connectHandler(input.Text)
		end
	end)

	function self:ApplyTheme()
		local colors = palette()
		for _, entry in self._themed do
			local object = entry[1]
			local property = entry[2]
			local colorName = entry[3]
			object[property] = colors[colorName]
		end
		for _, item in self._strokes do
			item.Color = colors.border
		end
	end

	self:ApplyTheme()
	Studio.ThemeChanged:Connect(function()
		self:ApplyTheme()
	end)
	return self
end

function UI:SetConnectionHandler(handler)
	self._connectHandler = handler
end

function UI:SetBusy(busy: boolean)
	self.Connect.Active = not busy
	self.Connect.Text = if busy then "Connecting…" else "Connect Studio"
	self.Input.TextEditable = not busy
end

function UI:SetMessage(text: string, isError: boolean)
	self.Message.Text = text
	self.Message.TextColor3 = if isError then Color3.fromRGB(211, 66, 66) else Color3.fromRGB(20, 139, 91)
	self.Message.Visible = text ~= ""
end

function UI:SetConnected(account: string)
	self.Status.Text = "Connected"
	self.Status.TextColor3 = Color3.fromRGB(16, 133, 86)
	self.Status.BackgroundColor3 = Color3.fromRGB(222, 248, 237)
	self.Instruction.Text = "This Studio installation is securely connected to Pathfinder."
	self.Input.Visible = false
	self.Connect.Visible = false
	self.PlaceCard.Visible = true
	self.PlaceName.Text = game.Name
	self.Account.Text = account
	self:SetMessage("Connection verified.", false)
end

return UI
