--!strict

assert(plugin, "Pathfinder must run as a Roblox Studio plugin")

local HttpService = game:GetService("HttpService")
local API = require(script.API)
local UI = require(script.UI)

local toolbar = plugin:CreateToolbar("Pathfinder")
local toolbarButton = toolbar:CreateButton(
	"Pathfinder",
	"Open Pathfinder",
	"",
	"Pathfinder"
)
toolbarButton.ClickableWhenViewportHidden = true

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Right,
	false,
	false,
	380,
	560,
	320,
	420
)
local widget = plugin:CreateDockWidgetPluginGuiAsync("PathfinderStudioAlpha", widgetInfo)
widget.Title = "Pathfinder"
widget.Name = "Pathfinder"

local interface = UI.new(widget)
local installationId = plugin:GetSetting("PathfinderInstallationId")
if type(installationId) ~= "string" or installationId == "" then
	installationId = HttpService:GenerateGUID(false)
	plugin:SetSetting("PathfinderInstallationId", installationId)
end

local sessionToken = plugin:GetSetting("PathfinderSessionToken")

local function verifySession(token: string)
	interface:SetBusy(true)
	interface:SetMessage("Checking your Pathfinder connection…", false)
	task.spawn(function()
		local success, response = API.Status(token, installationId)
		interface:SetBusy(false)
		if success and response.connected == true then
			interface:SetConnected(response.account or "Connected account")
		else
			plugin:SetSetting("PathfinderSessionToken", "")
			sessionToken = nil
			interface:SetMessage(if type(response) == "string" then response else "Connect Studio to continue.", true)
		end
	end)
end

interface:SetConnectionHandler(function(rawCode: string)
	local code = string.upper(string.gsub(rawCode, "%s+", ""))
	if not string.match(code, "^[A-HJ-NP-Z2-9][A-HJ-NP-Z2-9][A-HJ-NP-Z2-9][A-HJ-NP-Z2-9][A-HJ-NP-Z2-9][A-HJ-NP-Z2-9]$") then
		interface:SetMessage("Enter the six-character code from the Pathfinder website.", true)
		return
	end

	interface:SetBusy(true)
	interface:SetMessage("Connecting securely…", false)
	task.spawn(function()
		local success, response = API.Claim(code, installationId)
		interface:SetBusy(false)
		if not success then
			interface:SetMessage(if type(response) == "string" then response else "Studio could not connect.", true)
			return
		end
		if type(response.token) ~= "string" then
			interface:SetMessage("Pathfinder did not return a valid session.", true)
			return
		end
		sessionToken = response.token
		plugin:SetSetting("PathfinderSessionToken", sessionToken)
		interface:SetConnected(response.account or "Connected account")
	end)
end)

toolbarButton.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
widget:GetPropertyChangedSignal("Enabled"):Connect(function()
	toolbarButton:SetActive(widget.Enabled)
end)

if type(sessionToken) == "string" and sessionToken ~= "" then
	verifySession(sessionToken)
end
