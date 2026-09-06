import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-router" === null ? ({} as never) : require("@tanstack/react-query");
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: () => null,
});
