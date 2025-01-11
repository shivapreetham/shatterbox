import React from "react";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { X, MessageCircle, Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/hooks/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  createdAt: Date | string;
  userId: string;
}

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/anonymous/delete-message/${message.id}`
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        onMessageDelete(message.id);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="p-4">
          <div className="flex gap-2 justify-between items-start">
            <div className="flex items-start gap-3 w-full">
              <div className="mt-1">
                <MessageCircle className="w-5 h-5 text-primary/60" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-bold leading-relaxed text-foreground/90 break-words">
                  {message.content}
                </CardTitle>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-semibold">
                    Delete Message?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This action cannot be undone. This message will be permanently deleted
                    from your inbox.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="hover:bg-secondary/80">
                    Keep Message
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Message
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4 px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {dayjs(message.createdAt).format("MMM D, YYYY h:mm A")}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}