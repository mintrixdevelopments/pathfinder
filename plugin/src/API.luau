--!strict

local HttpService = game:GetService("HttpService")

local API = {}
local BASE_URL = "https://pathfinderlabs.vercel.app"

local function request(path: string, method: string, body: {[string]: any}, token: string?): (boolean, any)
	local headers = {
		["content-type"] = "application/json",
	}
	if token and token ~= "" then
		headers["authorization"] = `Bearer {token}`
	end

	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = BASE_URL .. path,
			Method = method,
			Headers = headers,
			Body = HttpService:JSONEncode(body),
		})
	end)
	if not success then
		return false, "Studio could not reach Pathfinder. Check the domain permission and try again."
	end

	local decodedSuccess, decoded = pcall(function()
		return HttpService:JSONDecode(response.Body)
	end)
	if not response.Success then
		if decodedSuccess and type(decoded) == "table" and type(decoded.error) == "string" then
			return false, decoded.error
		end
		return false, `Pathfinder returned HTTP {response.StatusCode}.`
	end
	if not decodedSuccess or type(decoded) ~= "table" then
		return false, "Pathfinder returned an unreadable response."
	end
	return true, decoded
end

function API.Claim(code: string, installationId: string): (boolean, any)
	return request("/api/plugin/pair/claim", "POST", {
		code = string.upper(code),
		installationId = installationId,
	}, nil)
end

function API.Status(token: string, installationId: string): (boolean, any)
	return request("/api/plugin/status", "POST", {
		installationId = installationId,
		placeId = game.PlaceId,
		gameId = game.GameId,
		placeName = game.Name,
	}, token)
end

return API
